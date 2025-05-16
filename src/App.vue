<template>
  <div class="h-screen bg-zinc-900 text-gray-200 p-1 sm:p-2 flex flex-col overflow-hidden">
    <Header 
      :connected="connected"
      @refresh="refreshFunctions"
      @toggle-checklist="toggleChecklistPanel"
      @toggle-keyboard-shortcuts="toggleKeyboardShortcutsModal"
    />

    <div v-if="loading" class="flex justify-center items-center flex-grow">
      <div class="text-xl font-mono">Loading...</div>
    </div>

    <main v-else class="grid grid-cols-1 md:grid-cols-5 gap-2 flex-grow overflow-hidden">
      <CueList
        :categorized-cues="categorizedCues"
        :current-cue-index="currentCueIndex"
        :active-cues="activeCues"
        :last-played-cue-id="lastPlayedCueId"
        v-model:selected-list="selectedCueList"
        @set-current-cue="setCurrentCue"
        @trigger-cue="triggerCue"
        @go-next="goNextCue"
      />
      
      <FunctionToggles
        :raw-cues="rawCues"
        :active-cues="activeCues"
        :toggle-tabs="toggleTabs"
        @trigger-cue="triggerCue"
        @toggle-cue="toggleCue"
      />
    </main>

    <KeyboardShortcutsModal
      v-if="showKeyboardShortcuts"
      :keyboard-macros="keyboardMacros"
      @close="toggleKeyboardShortcutsModal"
    />

    <ChecklistPanel
      v-if="showChecklistPanel"
      :checklists="checklists"
      :active-checklist="activeChecklist"
      :current-step="checklistCurrentStep"
      :error="checklistError"
      :automated-step-in-progress="automatedStepInProgress"
      @close="toggleChecklistPanel"
      @start="startChecklist"
      @cancel="cancelChecklist"
      @complete-step="completeCurrentStep"
      @retry-step="retryCurrentStep"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { QlcCue, WebSocketMessage, CueAction, ToggleTab, KeyboardMacro, Checklist } from '@/types';
import Header from '@/components/Header.vue';
import CueList from '@/components/CueList.vue';
import FunctionToggles from '@/components/FunctionToggles.vue';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal.vue';
import ChecklistPanel from '@/components/ChecklistPanel.vue';
import { checklists as checklistData } from '@/data/checklists';

export default defineComponent({
  name: 'App',
  components: {
    Header,
    CueList,
    FunctionToggles,
    KeyboardShortcutsModal,
    ChecklistPanel
  },
  setup() {
    // State
    const connected = ref(false);
    const loading = ref(true);
    const rawCues = ref<QlcCue[]>([]);
    const activeCues = ref<string[]>([]);
    const socket = ref<WebSocket | null>(null);
    const selectedCueList = ref('INTRO');
    const currentCueIndex = ref(0);
    const showKeyboardShortcuts = ref(false);
    const showChecklistPanel = ref(false);
    const lastPlayedCueId = ref<string | null>(null);

    // Checklist state
    const checklists = ref<Checklist[]>(checklistData);
    const selectedChecklistId = ref('');
    const activeChecklist = ref<Checklist | null>(null);
    const checklistCurrentStep = ref(0);
    const checklistError = ref('');
    const automatedStepInProgress = ref(false);

    // Toggle tabs configuration
    const toggleTabsConfig = ref<ToggleTab[]>([
      {
        name: 'Active',
        cues: []
      },
      {
        name: 'All',
        cues: []
      },
      {
        name: 'Custom',
        cues: ['QLC:59', 'QLC:20', 'QLC:140']
      }
    ]);

    // Keyboard shortcuts configuration
    const keyboardMacros = ref<KeyboardMacro[]>([
      { key: 'Tab', description: 'Go to next cue', handler: () => goNextCue() },
      { key: 'ArrowRight', description: 'Go to next cue', handler: () => goNextCue() },
      { key: 'PageUp', description: 'Select previous cue', handler: () => goPreviousCue() },
      { key: 'PageDown', description: 'Select next cue', handler: () => selectNextCue() },
      { key: 'b', description: 'Stop all active cues', handler: () => stopAllCues() },
      { key: 'B', description: 'Stop all cues (force)', handler: () => forceStopAllCues() },
    ]);

    // Computed properties
    const toggleTabs = computed(() => toggleTabsConfig.value);

    const categorizedCues = computed(() => {
      const orderedCategories = [
        'INTRO',
        'WEIGHT',
        'OFFERING',
        'POSE',
        'POT',
        'BOTTLE',
        'MAIZE',
        'SPLIT',
        'MUSIC',
        'BOMB',
        'PHOTOS',
        'SIGNOFF'
      ];
      
      const categories: Record<string, QlcCue[]> = {};
      
      // Initialize all categories with empty arrays
      orderedCategories.forEach(category => {
        categories[category] = [];
      });
      
      rawCues.value.forEach(cue => {
        if (cue.id.startsWith('CUE-')) {
          const parts = cue.id.split('-');
          if (parts.length >= 3) {
            const category = parts.slice(1, -1).join('-');
            if (categories[category] !== undefined) {
              categories[category].push(cue);
            }
          }
        }
      });
      
      // Sort cues within each category
      Object.keys(categories).forEach(category => {
        categories[category].sort((a, b) => a.id.localeCompare(b.id));
      });
      
      // Create a new object with only the ordered categories that have cues
      const orderedResult: Record<string, QlcCue[]> = {};
      orderedCategories.forEach(category => {
        if (categories[category].length > 0) {
          orderedResult[category] = categories[category];
        }
      });
      
      return orderedResult;
    });

    // Methods
    function connectWebSocket(): void {
      socket.value = new WebSocket('wss://wss.makereal.co/lst');
      
      socket.value.onopen = () => {
        connected.value = true;
        console.log('WebSocket connected');
        socket.value?.send(JSON.stringify({
          subscribe: 'main',
        }));
        
        socket.value?.send(JSON.stringify({
          channel: 'main',
          type: 'getState'
        }));
      };
      
      socket.value.onclose = () => {
        connected.value = false;
        console.log('WebSocket disconnected');
        setTimeout(connectWebSocket, 3000);
      };
      
      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      socket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          
          switch (message.type) {
            case 'state':
              if (message.data && 'cueMapping' in message.data && Array.isArray(message.data.cueMapping)) {
                rawCues.value = message.data.cueMapping;
                loadToggleTabsConfig();
              }
              if (message.data && 'activeCues' in message.data && message.data.activeCues) {
                activeCues.value = message.data.activeCues;
              }
              loading.value = false;
              break;
              
            case 'cueResult':
              console.log('Cue result:', message);
              break;
              
            case 'error':
              console.error('Server error:', message.message);
              break;
              
            case 'tabConfig':
              if (message.data && 'tabs' in message.data) {
                loadToggleTabsConfig(message.data.tabs);
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    }

    function refreshFunctions(): void {
      socket.value?.readyState === WebSocket.OPEN && 
      socket.value.send(JSON.stringify({
        channel: 'main',
        type: 'refreshFunctions'
      }));
    }

    function triggerCue(qlcId: number, action: CueAction): void {
      if (socket.value?.readyState === WebSocket.OPEN) {
        if (action === 'start') {
          const cue = rawCues.value.find(c => c.qlcId === qlcId);
          if (cue) {
            lastPlayedCueId.value = cue.id;
          }
        }
        
        socket.value.send(JSON.stringify({
          channel: 'main',
          type: 'triggerCue',
          qlcId,
          action
        }));
      }
    }

    function toggleCue(qlcId: number): void {
      const cue = rawCues.value.find(c => c.qlcId === qlcId);
      if (cue) {
        const isCurrentlyActive = activeCues.value.includes(cue.id);
        triggerCue(qlcId, isCurrentlyActive ? 'stop' : 'start');
      }
    }

    function setCurrentCue(index: number): void {
      currentCueIndex.value = index;
    }

    function goNextCue(): void {
      const currentCue = categorizedCues.value[selectedCueList.value]?.[currentCueIndex.value];
      if (currentCue) {
        if (activeCues.value.includes(currentCue.id)) {
          triggerCue(currentCue.qlcId, 'stop');
          setTimeout(() => triggerCue(currentCue.qlcId, 'start'), 100);
        } else {
          categorizedCues.value[selectedCueList.value].forEach(cue => {
            if (cue.id !== currentCue.id && activeCues.value.includes(cue.id)) {
              triggerCue(cue.qlcId, 'stop');
            }
          });
          triggerCue(currentCue.qlcId, 'start');
        }
        
        if (currentCueIndex.value < categorizedCues.value[selectedCueList.value].length - 1) {
          currentCueIndex.value++;
        } else {
          // Move to the next list if we're at the end of the current list
          const lists = Object.keys(categorizedCues.value);
          const currentListIndex = lists.indexOf(selectedCueList.value);
          if (currentListIndex < lists.length - 1) {
            selectedCueList.value = lists[currentListIndex + 1];
            currentCueIndex.value = 0;
          }
        }
      }
    }

    function goPreviousCue(): void {
      if (currentCueIndex.value > 0) {
        currentCueIndex.value--;
      }
    }

    function selectNextCue(): void {
      const maxIndex = (categorizedCues.value[selectedCueList.value]?.length || 0) - 1;
      if (maxIndex >= 0) {
        currentCueIndex.value = currentCueIndex.value < maxIndex ? currentCueIndex.value + 1 : 0;
      }
    }

    function stopAllCues(): void {
      activeCues.value.forEach(cueId => {
        const cue = rawCues.value.find(c => c.id === cueId);
        if (cue) {
          triggerCue(cue.qlcId, 'stop');
        }
      });
    }

    function forceStopAllCues(): void {
      rawCues.value.forEach(cue => triggerCue(cue.qlcId, 'stop'));
    }

    function toggleKeyboardShortcutsModal(): void {
      showKeyboardShortcuts.value = !showKeyboardShortcuts.value;
    }

    function toggleChecklistPanel(): void {
      showChecklistPanel.value = !showChecklistPanel.value;
      if (!showChecklistPanel.value) {
        cancelChecklist();
      }
    }

    // Checklist methods
    function startChecklist(id: string): void {
      selectedChecklistId.value = id;
      const list = checklists.value.find(l => l.id === id);
      if (list) {
        activeChecklist.value = list;
        checklistCurrentStep.value = 0;
        checklistError.value = '';
        
        if (list.steps[0]?.type === 'automated') {
          executeAutomatedStep();
        }
      }
    }

    function cancelChecklist(): void {
      activeChecklist.value = null;
      checklistCurrentStep.value = 0;
      checklistError.value = '';
      automatedStepInProgress.value = false;
      selectedChecklistId.value = '';
    }

    function completeCurrentStep(): void {
      if (!activeChecklist.value) return;
      
      checklistCurrentStep.value++;
      checklistError.value = '';
      
      if (checklistCurrentStep.value >= activeChecklist.value.steps.length) {
        return;
      }
      
      if (activeChecklist.value.steps[checklistCurrentStep.value]?.type === 'automated') {
        executeAutomatedStep();
      }
    }

    function retryCurrentStep(): void {
      if (!activeChecklist.value || activeChecklist.value.steps[checklistCurrentStep.value]?.type !== 'automated') return;
      
      checklistError.value = '';
      automatedStepInProgress.value = false;
      executeAutomatedStep();
    }

    function executeAutomatedStep(): void {
      if (!activeChecklist.value) return;
      
      const step = activeChecklist.value.steps[checklistCurrentStep.value];
      console.log(`Executing automated step: ${step.action}`);
      
      automatedStepInProgress.value = true;
      
      if (socket.value?.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({
          channel: 'main',
          type: step.action
        }));
        
        setTimeout(() => {
          automatedStepInProgress.value = false;
          
          if (Math.random() > 0.2) {
            completeCurrentStep();
          } else {
            checklistError.value = `Failed to execute ${step.action}. Please try again.`;
          }
        }, 2000);
      } else {
        automatedStepInProgress.value = false;
        checklistError.value = "Cannot communicate with server";
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      const macro = keyboardMacros.value.find(m => m.key === event.key);
      if (macro) {
        event.preventDefault();
        macro.handler();
      }
    }

    function loadToggleTabsConfig(tabs?: ToggleTab[]): void {
      if (tabs) {
        toggleTabsConfig.value = tabs;
      } else {
        // Initialize default tabs based on raw cues
        toggleTabsConfig.value = [
          {
            name: 'Active',
            cues: activeCues.value
          },
          {
            name: 'All',
            cues: rawCues.value.map(cue => cue.id)
          },
          {
            name: 'Custom',
            cues: ['QLC:59', 'QLC:20', 'QLC:140']
          }
        ];
      }
    }

    // Watch for changes in selectedCueList
    watch(selectedCueList, () => {
      currentCueIndex.value = 0;
    });

    // Lifecycle hooks
    onMounted(() => {
      connectWebSocket();
      window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
      socket.value?.close();
      window.removeEventListener('keydown', handleKeyDown);
    });

    return {
      // State
      connected,
      loading,
      rawCues,
      activeCues,
      selectedCueList,
      currentCueIndex,
      toggleTabs,
      categorizedCues,
      showKeyboardShortcuts,
      keyboardMacros,
      lastPlayedCueId,
      
      // Checklist state
      showChecklistPanel,
      checklists,
      selectedChecklistId,
      activeChecklist,
      checklistCurrentStep,
      checklistError,
      automatedStepInProgress,
      
      // Methods
      refreshFunctions,
      triggerCue,
      toggleCue,
      setCurrentCue,
      goNextCue,
      toggleKeyboardShortcutsModal,
      toggleChecklistPanel,
      startChecklist,
      cancelChecklist,
      completeCurrentStep,
      retryCurrentStep
    };
  }
});</script>
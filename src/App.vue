<template>
  <div class="h-screen bg-zinc-900 text-gray-200 p-1 sm:p-2 flex flex-col overflow-hidden">
    <!-- Header with connection status - more industrial with square corners -->
    <header class="bg-zinc-800 p-2 rounded-sm border-2 border-zinc-700 shadow-lg mb-2 flex justify-between items-center">
      <h1 class="text-lg font-bold font-mono tracking-wider">CUE CONTROLLER</h1>
      <div class="flex items-center space-x-3">
        <div class="flex items-center bg-zinc-900 px-2 py-1 border border-zinc-600 rounded-sm">
          <div :class="['w-3 h-3 mr-1', connected ? 'bg-green-500 animate-pulse' : 'bg-red-500']"></div>
          <span class="text-xs font-mono">{{ connected ? 'CONNECTED' : 'DISCONNECTED' }}</span>
        </div>
        <button 
          @click="refreshFunctions" 
          class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
        >
          REFRESH
        </button>
        <!-- Added keyboard shortcuts button -->
        <button 
          @click="toggleKeyboardShortcutsModal" 
          class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
          title="Keyboard Shortcuts"
        >
          ?
        </button>
        <!-- Add this button to the header next to the other buttons -->
        <button 
          @click="toggleChecklistPanel" 
          class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
        >
          CHECKLISTS
        </button>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center items-center flex-grow">
      <div class="text-xl font-mono">Loading...</div>
    </div>

    <main v-else class="grid grid-cols-1 md:grid-cols-5 gap-2 flex-grow overflow-hidden">
      <!-- Left side: Cue List - more industrial with square corners -->
      <div class="md:col-span-3 bg-zinc-800 rounded-sm border-2 border-zinc-700 shadow-lg p-2 flex flex-col overflow-hidden">
        <h2 class="text-lg font-bold font-mono mb-1 uppercase tracking-wide">Cue List</h2>
        
        <!-- Cue list selector - industrial style -->
        <div class="mb-2">
          <select 
            v-model="selectedCueList" 
            class="w-full bg-zinc-700 border-2 border-zinc-600 rounded-sm p-2 text-base font-mono focus:outline-none focus:border-blue-500"
          >
            <option v-for="(_, category) in categorizedCues" :key="category" :value="category">
              {{ category }} LIST
            </option>
          </select>
        </div>
        
        <!-- Cues in the selected list - industrial scrollable area with improved separation -->
        <div class="flex-grow overflow-y-auto mb-2 pr-1 border border-zinc-700 bg-zinc-850 p-1 select-none">
          <div 
            v-for="(cue, index) in selectedCueListItems" 
            :key="cue.id" 
                        class="p-2 mb-1 transition-colors border-l-4 border-r border-t border-b cursor-pointer"
            :class="[
              currentCueIndex === index 
                ? ['bg-blue-900', 'border-blue-500'] 
                : isActive(cue.id)
                  ? ['bg-zinc-800', 'border-green-500']
                  : lastPlayedCueId === cue.id
                    ? ['bg-zinc-800', 'border-orange-500']
                    : ['bg-zinc-800', 'border-zinc-700']
            ]"

            @click="setCurrentCue(index)"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-2 h-full mr-2" :class="isActive(cue.id) ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'"></div>
                <div>
                  <span class="font-mono text-lg text-gray-400 font-bold" :title="`QLC ID: ${cue.qlcId}`">{{ cue.id }}</span>
                  <span class="ml-1 font-medium text-lg">{{ cue.name }}</span>
                </div>
              </div>
            <div class="flex space-x-1">
              <button 
                  @click.stop="triggerCue(cue.qlcId, isActive(cue.id) ? 'stop' : 'start')" 
                  :class="[
                    'px-3 py-1 rounded-sm text-sm font-bold font-mono transition-colors border-2',
                    isActive(cue.id) ? 'bg-red-800 hover:bg-red-700 border-red-600' : 'bg-green-800 hover:bg-green-700 border-green-600'
                  ]"
                >
                  {{ isActive(cue.id) ? 'STOP' : 'START' }}
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="selectedCueListItems.length === 0" class="text-gray-400 text-center py-4 text-sm font-mono">
            No cues in this list
          </div>
        </div>
        
        <!-- Go button and next cue - fixed at bottom with industrial styling -->
        <div class="grid grid-cols-5 gap-2 mt-auto">
          <button 
            @click="goNextCue" 
            class="col-span-2 bg-green-800 hover:bg-green-700 text-white font-bold font-mono py-3 px-4 rounded-sm text-xl transition-colors border-2 border-green-600 uppercase"
          >
            GO
          </button>
          
          <div class="col-span-3 bg-zinc-800 border-2 border-zinc-700 rounded-sm p-2">
            <div class="text-xs text-gray-400 uppercase font-bold font-mono">Next Cue:</div>
            <div class="font-bold truncate text-base">
              {{ nextCue ? `${nextCue.id} - ${nextCue.name}` : 'End of list' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right side: Function Toggles - industrial styling -->
      <div class="md:col-span-2 bg-zinc-800 rounded-sm border-2 border-zinc-700 shadow-lg p-2 flex flex-col overflow-hidden">
        <h2 class="text-lg font-bold font-mono mb-1 uppercase tracking-wide">Function Toggles</h2>
        
        <!-- Toggle categories with industrial tabs -->
        <div class="mb-2">
          <div class="flex space-x-1 overflow-x-auto pb-1">
            <button 
              v-for="tab in toggleTabs" 
              :key="tab.name"
              @click="toggleCategory = tab.name"
              :class="[
                'px-2 py-1 rounded-none text-sm font-bold font-mono transition-colors whitespace-nowrap uppercase border-2',
                toggleCategory === tab.name ? 'bg-blue-800 border-blue-500' : 'bg-zinc-700 hover:bg-zinc-600 border-zinc-600'
              ]"
            >
              {{ tab.name }}
            </button>
          </div>
        </div>
        
        <!-- Toggle buttons grid - industrial scrollable area -->
        <div class="overflow-y-auto flex-grow border border-zinc-700 bg-zinc-850 p-1">
          <!-- Active Cues Tab -->
          <div v-if="toggleCategory === 'Active'">
            <div v-if="activeCues.length === 0" class="text-gray-400 text-center py-4 text-sm font-mono">
              No active cues
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <div 
                v-for="cueId in activeCues" 
                :key="cueId" 
                class="px-3 py-2 bg-green-800 border-2 border-green-600 rounded-sm flex items-center text-sm w-full"
              >
                <div class="flex-1">
                  <span class="font-mono text-xs text-gray-300 mr-1">{{ getQlcId(cueId) }}</span>
                  <span class="font-mono">{{ cueId }} - {{ getCueName(cueId) }}</span>
                </div>
                <button 
                  @click="triggerCue(getQlcId(cueId), 'stop')" 
                  class="ml-1 px-2 py-1 rounded-sm bg-red-800 hover:bg-red-700 flex items-center justify-center font-bold text-xs font-mono border border-red-600"
                >
                  STOP
                </button>
              </div>
            </div>
          </div>
          
          <!-- Regular Toggle Buttons for other tabs -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
            <div 
              v-for="cue in filteredToggleCues" 
              :key="cue.id" 
              class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"
              :class="{ 'ring-1 ring-green-500 bg-zinc-700 border-green-600': isActive(cue.id) }"
              @click="toggleCue(cue.qlcId)"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center">
                  <div 
                    class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black"
                    :class="[getCueTypeColor(cue.id), isActive(cue.id) ? 'animate-pulse' : '']"
                  >
                    <span class="text-black text-xs font-bold font-mono">{{ cue.id.slice(0, 3) }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-xs font-mono mr-1">{{ cue.qlcId }}</span>
                    <div class="w-2 h-2 rounded-none mr-1 border border-zinc-400" :class="isActive(cue.id) ? 'bg-green-500' : 'bg-zinc-500'"></div>
                  </div>
                </div>
                <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600" :class="isActive(cue.id) ? 'bg-green-800 border-green-600' : 'bg-zinc-700'">
                  {{ isActive(cue.id) ? 'ACTIVE' : 'IDLE' }}
                </span>
              </div>
              <div class="text-sm font-mono break-words">{{ cue.name }}</div>
            </div>
            
            <div v-if="filteredToggleCues.length === 0" class="text-gray-400 text-center py-4 text-sm font-mono col-span-2">
              No toggles in this category
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Keyboard shortcuts modal -->
    <div 
      v-if="showKeyboardShortcuts" 
      class="fixed inset-0 flex items-center justify-center z-10"
      style="background-color: rgba(0, 0, 0, 0.6);"
      @click="toggleKeyboardShortcutsModal"
    >
      <div 
        class="bg-zinc-800 p-3 rounded-sm border-2 border-zinc-600 shadow-lg max-w-md"
        @click.stop
      >
        <div class="flex justify-between items-center mb-1">
          <h3 class="font-bold uppercase text-sm font-mono">Keyboard Shortcuts</h3>
          <button @click="toggleKeyboardShortcutsModal" class="text-gray-400 hover:text-white font-mono">×</button>
        </div>
        <div class="max-h-60 overflow-y-auto border border-zinc-700 px-1 py-2 flex flex-col gap-2">
          <div v-for="(macro, index) in keyboardMacros" :key="index" class="text-sm">
            <span class="bg-zinc-700 px-2 py-1 rounded-sm mr-1 font-mono border-2 border-zinc-600">{{ macro.key }}</span>
            <span class="font-mono pr-4">{{ macro.description }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add this at the bottom of your template, before the closing </div> of the main container -->
    <div 
      v-if="showChecklistPanel" 
      class="fixed inset-0 flex z-20"
      @click="toggleChecklistPanel"
    >
      <div 
        class="bg-zinc-900/60 w-full"
        @click.stop
      ></div>
      <div 
        class="w-full max-w-md bg-zinc-800 border-l-2 border-zinc-700 p-4 flex flex-col h-full overflow-hidden"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold font-mono uppercase tracking-wide">Checklist: {{ currentChecklist?.name || 'Select a Checklist' }}</h2>
          <button @click="toggleChecklistPanel" class="text-gray-400 hover:text-white font-mono text-xl">×</button>
        </div>
        
        <!-- Checklist selector -->
        <div v-if="!activeChecklist" class="mb-4">
          <select 
            v-model="selectedChecklistId" 
            class="w-full bg-zinc-700 border-2 border-zinc-600 rounded-sm p-2 text-base font-mono focus:outline-none focus:border-blue-500 mb-2"
          >
            <option value="">Select a checklist</option>
            <option v-for="list in checklists" :key="list.id" :value="list.id">
              {{ list.name }}
            </option>
          </select>
          <button 
            @click="startChecklist"
            :disabled="!selectedChecklistId"
            class="w-full bg-green-800 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-bold font-mono py-2 px-4 rounded-sm text-base transition-colors border-2 border-green-600 uppercase"
          >
            Start Checklist
          </button>
        </div>
        
        <!-- Active checklist -->
        <div v-if="activeChecklist" class="flex-1 flex flex-col overflow-hidden">
          <!-- Progress bar -->
          <div class="h-4 bg-zinc-700 rounded-sm mb-4 overflow-hidden">
            <div 
              class="h-full bg-blue-600" 
              :style="{width: `${checklistProgress}%`}"
            ></div>
          </div>
          
          <!-- Steps list -->
          <div class="flex-1 overflow-y-auto border border-zinc-700 bg-zinc-850 p-2 mb-4">
            <div 
              v-for="(step, index) in activeChecklist.steps" 
              :key="index"
              class="p-3 mb-2 border-l-4 rounded-sm flex items-start"
              :class="getStepClasses(index)"
            >
              <!-- Step status indicator -->
              <div class="mr-3 mt-1">
                <div v-if="checklistCurrentStep > index" class="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
                  <span class="text-white">✓</span>
                </div>
                <div v-else-if="checklistCurrentStep === index" class="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center animate-pulse">
                  <span class="text-white">→</span>
                </div>
                <div v-else class="w-6 h-6 border-2 border-zinc-600 rounded-sm"></div>
              </div>
              
              <!-- Step content -->
              <div class="flex-1">

                <div class="font-mono font-bold flex items-center">
                  {{ step.name }}
                  <!-- Type badge -->
                  <span 
                    :class="[
                      'text-xs ml-2 px-2 py-0.5 rounded-sm font-normal',
                      step.type === 'automated' 
                        ? 'bg-purple-800 text-purple-200 border border-purple-600' 
                        : 'bg-zinc-700 text-zinc-300 border border-zinc-600'
                    ]"
                  >
                    {{ step.type === 'automated' ? 'AUTO' : 'MANUAL' }}
                  </span>
                </div>
                <div class="text-sm text-gray-300">{{ step.description }}</div>
                
                <!-- Loading indicator for automated steps -->
                <div 
                  v-if="index === checklistCurrentStep && step.type === 'automated' && automatedStepInProgress" 
                  class="mt-2 flex items-center text-sm text-blue-300"
                >
                  <div class="mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Processing automated task...
                </div>
                
                <!-- Error message -->
                <div v-if="index === checklistCurrentStep && checklistError" class="mt-2 p-2 bg-red-900/50 border border-red-700 text-sm">
                  Error: {{ checklistError }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div class="flex space-x-2">
            <button 
              @click="cancelChecklist" 
              class="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold font-mono py-2 px-4 rounded-sm text-base transition-colors border-2 border-red-600"
            >
              Cancel
            </button>
            
            <!-- For manual steps -->
            <button 
              v-if="!isCurrentStepAutomated"
              @click="completeCurrentStep" 
              class="flex-1 bg-green-800 hover:bg-green-700 text-white font-bold font-mono py-2 px-4 rounded-sm text-base transition-colors border-2 border-green-600"
            >
              Complete Step
            </button>
            
            <!-- For automated steps with error -->
            <button 
              v-else-if="checklistError"
              @click="retryCurrentStep" 
              class="flex-1 bg-yellow-800 hover:bg-yellow-700 text-white font-bold font-mono py-2 px-4 rounded-sm text-base transition-colors border-2 border-yellow-600"
            >
              Retry Automated Step
            </button>
            
            <!-- For automated steps in progress -->
            <button 
              v-else-if="automatedStepInProgress"
              disabled
              class="flex-1 bg-blue-900 text-white font-bold font-mono py-2 px-4 rounded-sm text-base border-2 border-blue-700 opacity-80 cursor-not-allowed flex items-center justify-center"
            >
              <span class="mr-2 w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { Cue, CueState, WebSocketMessage, CueAction } from '@/types';

interface QlcCue {
  qlcId: number;
  id: string;
  name: string;
  fullName: string;
}

interface ToggleTab {
  name: string;
  cues: string[];  // Can contain normal IDs or "QLC:123" formatted IDs
}

export default defineComponent({
  name: 'App',
  setup() {
    // State
    const connected = ref(false);
    const loading = ref(true);
    const rawCues = ref<QlcCue[]>([]);
    const activeCues = ref<string[]>([]);
    const socket = ref<WebSocket | null>(null);
    const selectedCueList = ref('INTRO');
    const currentCueIndex = ref(0);
    const toggleCategory = ref('Active');
    const showKeyboardShortcuts = ref(false);
    const lastPlayedCueId = ref<string | null>(null);
    
    // JSON configuration for toggle tabs
    const toggleTabsConfig = ref<ToggleTab[]>([
      {
        name: 'Active',
        cues: []  // Will show active cues
      },
      {
        name: 'All',
        cues: []  // Empty means all cues will be shown
      },
      {
        name: 'Custom',
        cues: ['QLC:59', 'QLC:20', 'QLC:140'] // Mix of normal IDs and QLC IDs
      }
    ]);

    // Computed properties
    const toggleTabs = computed(() => {
      return toggleTabsConfig.value;
    });

    const cueIdToQlcIdMap = computed(() => {
      const map: Record<string, number> = {};
      rawCues.value.forEach(cue => {
        map[cue.id] = cue.qlcId;
      });
      return map;
    });

    const qlcIdToCueMap = computed(() => {
      const map: Record<number, QlcCue> = {};
      rawCues.value.forEach(cue => {
        map[cue.qlcId] = cue;
      });
      return map;
    });

    const categorizedCues = computed(() => {
      const categories: Record<string, QlcCue[]> = {};
      
      rawCues.value.forEach(cue => {
        // Check if the cue ID starts with "CUE-"
        if (cue.id.startsWith('CUE-')) {
          // Extract the list name (everything after "CUE-" and before the last hyphen)
          const parts = cue.id.split('-');
          if (parts.length >= 3) {
            // Get all middle parts (exclude "CUE" and the number part)
            const category = parts.slice(1, -1).join('-');
            
            if (!categories[category]) {
              categories[category] = [];
            }
            
            categories[category].push(cue);
          }
        }
      });
      
      // Sort cues within each category
      Object.keys(categories).forEach(category => {
        categories[category].sort((a, b) => a.id.localeCompare(b.id));
      });
      
      return categories;
    });

    const selectedCueListItems = computed(() => {
      return categorizedCues.value[selectedCueList.value] || [];
    });

    const nextCue = computed(() => {
      if (currentCueIndex.value < selectedCueListItems.value.length - 1) {
        return selectedCueListItems.value[currentCueIndex.value + 1];
      }
      return null;
    });

    const filteredToggleCues = computed(() => {
      // If it's the Active tab, return empty array since we handle this specially in the template
      if (toggleCategory.value === 'Active') {
        return [];
      }
      
      // Find the current tab
      const currentTab = toggleTabsConfig.value.find(tab => tab.name === toggleCategory.value);
      
      if (!currentTab) return [];
      
      // If it's the All tab or the cues array is empty, show all cues
      if (currentTab.name === 'All' || currentTab.cues.length === 0) {
        // Special handling for default tabs
        if (currentTab.name === 'BGM') {
          return rawCues.value.filter(cue => cue.id.startsWith('BGM'));
        } else if (currentTab.name === 'Lights') {
          return rawCues.value.filter(cue => cue.id.startsWith('LT'));
        } else if (currentTab.name === 'SFX') {
          return rawCues.value.filter(cue => cue.id.startsWith('SFX'));
        }
        return rawCues.value;
      }
      
      // Filter cues based on the tab's cue list
      return rawCues.value.filter(cue => {
        return currentTab.cues.some(configCueId => {
          // Check if it's a QLC ID reference
          if (configCueId.startsWith('QLC:')) {
            const qlcId = parseInt(configCueId.substring(4));
            return cue.qlcId === qlcId;
          }
          // Otherwise it's a normal ID
          return cue.id === configCueId;
        });
      });
    });

    // Methods
    function loadToggleTabsConfig(config: ToggleTab[]): void {
      // Make sure we have the 'Active' tab
      if (!config.some(tab => tab.name === 'Active')) {
        config.push({
          name: 'Active',
          cues: []
        });
      }
      
      toggleTabsConfig.value = config;
      // Set to first tab by default
      if (config.length > 0) {
        toggleCategory.value = config[0].name;
      }
    }

    function connectWebSocket(): void {
      socket.value = new WebSocket('ws://10.1.16.139:7007');
      
      socket.value.onopen = () => {
        connected.value = true;
        console.log('WebSocket connected');
        socket.value.send(JSON.stringify({
          subscribe: 'main',
        }));
        console.log('Subscribed to main channel');
        
        // Request current state
        if (socket.value) {
          socket.value.send(JSON.stringify({
            channel: 'main',
            type: 'getState'
          }));
          console.log('Requested current state');
        }
      };
      
      socket.value.onclose = () => {
        connected.value = false;
        console.log('WebSocket disconnected');
        
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      socket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('Received message:', message);
          
          switch (message.type) {
            case 'state':
              // Handle the new format where cueMapping is an array
              if (Array.isArray(message.data.cueMapping)) {
                rawCues.value = message.data.cueMapping;
                
                // Initialize default tab configurations based on received cues
                initializeDefaultTabs();
              }
              activeCues.value = message.data.activeCues;
              loading.value = false;
              break;
              
            case 'cueResult':
              console.log('Cue result:', message);
              break;
              
            case 'error':
              console.error('Server error:', message.message);
              break;
              
            case 'tabConfig':
              // Handle receiving tab configuration from server
              if (message.data && Array.isArray(message.data.tabs)) {
                loadToggleTabsConfig(message.data.tabs);
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    }

    function initializeDefaultTabs(): void {
      // Find default tabs that need auto-population
      const bgmTab = toggleTabsConfig.value.find(tab => tab.name === 'BGM' && tab.cues.length === 0);
      const lightsTab = toggleTabsConfig.value.find(tab => tab.name === 'Lights' && tab.cues.length === 0);
      const sfxTab = toggleTabsConfig.value.find(tab => tab.name === 'SFX' && tab.cues.length === 0);
      
      // Auto-populate BGM tab
      if (bgmTab) {
        bgmTab.cues = rawCues.value
          .filter(cue => cue.id.startsWith('BGM'))
          .map(cue => cue.id);
      }
      
      // Auto-populate Lights tab
      if (lightsTab) {
        lightsTab.cues = rawCues.value
          .filter(cue => cue.id.startsWith('LT'))
          .map(cue => cue.id);
      }
      
      // Auto-populate SFX tab
      if (sfxTab) {
        sfxTab.cues = rawCues.value
          .filter(cue => cue.id.startsWith('SFX'))
          .map(cue => cue.id);
      }
      
      // Make sure we have the 'Active' tab
      if (!toggleTabsConfig.value.some(tab => tab.name === 'Active')) {
        toggleTabsConfig.value.push({
          name: 'Active',
          cues: []
        });
      }
    }

    function refreshFunctions(): void {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({
          channel: 'main',
          type: 'refreshFunctions'
        }));
      }
    }

    function triggerCue(qlcId: number, action: CueAction): void {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        // If we're starting a cue, remember it as the last played
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
        const isCurrentlyActive = isActive(cue.id);
        triggerCue(qlcId, isCurrentlyActive ? 'stop' : 'start');
      }
    }

    function isActive(cueId: string): boolean {
      return activeCues.value.includes(cueId);
    }

    function getCueName(cueId: string): string {
      const cue = rawCues.value.find(c => c.id === cueId);
      return cue ? cue.name : cueId;
    }

    function getQlcId(cueId: string): number {
      const cue = rawCues.value.find(c => c.id === cueId);
      return cue ? cue.qlcId : -1;
    }

    function getCueTypeColor(cueId: string): string {
      if (cueId.startsWith('BGM')) {
        return 'bg-purple-400';
      }
      if (cueId.startsWith('LT')) {
        return 'bg-yellow-400';
      }
      if (cueId.startsWith('SFX')) {
        return 'bg-red-400';
      }
      return 'bg-blue-400';
    }

    function setCurrentCue(index: number): void {
      currentCueIndex.value = index;
    }

    function goNextCue(): void {
      if (currentCueIndex.value < selectedCueListItems.value.length) {
        const currentCue = selectedCueListItems.value[currentCueIndex.value];
        
        // Check if current cue is active and stop it first
        if (isActive(currentCue.id)) {
          triggerCue(currentCue.qlcId, 'stop');
          
          // Short delay to ensure the cue is fully stopped before restarting
          setTimeout(() => {
            triggerCue(currentCue.qlcId, 'start');
          }, 100);
        } else {
          // Stop all other active cues in the current cue list
          selectedCueListItems.value.forEach(cue => {
            if (cue.id !== currentCue.id && isActive(cue.id)) {
              triggerCue(cue.qlcId, 'stop');
            }
          });
          
          // Start the current cue
          triggerCue(currentCue.qlcId, 'start');
        }
        
        // Move to next cue
        if (currentCueIndex.value < selectedCueListItems.value.length - 1) {
          currentCueIndex.value++;
        }
      }
    }

    function goPreviousCue(): void {
      if (currentCueIndex.value > 0) {
        currentCueIndex.value--;
      }
    }

    function selectNextCue(): void {
      if (currentCueIndex.value < selectedCueListItems.value.length - 1) {
        currentCueIndex.value++;
      } else if (selectedCueListItems.value.length > 0) {
        // Loop back to the beginning if at the end
        currentCueIndex.value = 0;
      }
    }

    // Method to save the current tab configuration to server or local storage
    function saveTabConfig(): void {
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({
          channel: 'main',
          type: 'saveTabConfig',
          data: {
            tabs: toggleTabsConfig.value
          }
        }));
      }
      
      // Can also save to localStorage as a backup
      try {
        localStorage.setItem('toggleTabsConfig', JSON.stringify(toggleTabsConfig.value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }

    // Method to load tab configuration from local storage
    function loadTabConfigFromStorage(): void {
      try {
        const storedConfig = localStorage.getItem('toggleTabsConfig');
        if (storedConfig) {
          loadToggleTabsConfig(JSON.parse(storedConfig));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }

    // Toggle keyboard shortcuts modal
    function toggleKeyboardShortcutsModal(): void {
      showKeyboardShortcuts.value = !showKeyboardShortcuts.value;
    }

    // Keyboard shortcuts configuration
    const keyboardMacros = ref([
      { key: 'Tab', description: 'Go to next cue', handler: () => goNextCue() },
      { key: 'Space', description: 'Go to next cue', handler: () => goNextCue() },
      { key: 'PageUp', description: 'Select previous cue', handler: () => goPreviousCue() },
      { key: 'PageDown', description: 'Select next cue', handler: () => selectNextCue() },
      { key: 'b', description: 'Stop all active cues', handler: () => stopAllCues() },
      { key: 'B', description: 'Stop all cues (force)', handler: () => forceStopAllCues() },
      { key: 'F11', description: 'Play QLC ID 7', handler: () => triggerCue(7, 'start') },
    ]);
    
    // Handler for keyboard events
    function handleKeyDown(event: KeyboardEvent): void {
      // Skip if focus is in an input element
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          event.target instanceof HTMLSelectElement) {
        return;
      }
      
      // Special handling for Space key
      if (event.code === 'Space') {
        event.preventDefault();
        goNextCue();
        console.log('Executed keyboard macro: Go to next cue');
        return;
      }
      
      // Find and execute the matching macro
      const macro = keyboardMacros.value.find(m => 
        m.key === event.key || 
        m.key === event.code
      );
      
      if (macro) {
        event.preventDefault();
        macro.handler();
        console.log(`Executed keyboard macro: ${macro.description}`);
      }
    }
    
    // Add a new macro (can be called programmatically or exposed as a method)
    function addKeyboardMacro(key: string, description: string, handler: () => void): void {
      // Remove any existing macro with the same key
      keyboardMacros.value = keyboardMacros.value.filter(m => m.key !== key);
      // Add the new macro
      keyboardMacros.value.push({ key, description, handler });
    }
    
    // Method to stop all currently active cues
    function stopAllCues(): void {
      if (activeCues.value.length > 0) {
        activeCues.value.forEach(cueId => {
          const qlcId = getQlcId(cueId);
          if (qlcId !== -1) {
            triggerCue(qlcId, 'stop');
          }
        });
      }
    }

    function forceStopAllCues(): void {
      // Stop every single cue regardless of active status
      rawCues.value.forEach(cue => {
        triggerCue(cue.qlcId, 'stop');
      });
      console.log('Forced stop on ALL cues');
    }

    // Lifecycle hooks
    onMounted(() => {
      // Try to load config from localStorage first
      loadTabConfigFromStorage();
      
      // Then connect to get live data
      connectWebSocket();
      
      // Add keyboard event listener
      window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
      if (socket.value) {
        socket.value.close();
      }
      
      // Remove keyboard event listener
      window.removeEventListener('keydown', handleKeyDown);
    });

    // Add these to your setup() function
const showChecklistPanel = ref(false);
const checklists = ref([
  {
    id: 'venue-open',
    name: 'Venue Opening Procedure',
    steps: [
      {
        name: 'Start QLC+',
        description: 'Launching lighting control software',
        type: 'automated',
        action: 'startQlc'
      },
      {
        name: 'Start LST Controller',
        description: 'Launching show control software',
        type: 'automated',
        action: 'startLstController'
      },
      {
        name: 'Turn off shop lights',
        description: 'Switch off all work lights in shop area',
        type: 'manual',
      },
      {
        name: 'Move props to stage',
        description: 'Place all marked props in their starting positions',
        type: 'manual',
      }
    ]
  },
  {
    id: 'venue-close',
    name: 'Venue Closing Procedure',
    steps: [
      // Add steps for closing procedure
    ]
  }
]);

const selectedChecklistId = ref('');
const activeChecklist = ref(null);
const checklistCurrentStep = ref(0);
const checklistError = ref('');

const currentChecklist = computed(() => {
  return checklists.value.find(list => list.id === selectedChecklistId.value);
});

const checklistProgress = computed(() => {
  if (!activeChecklist.value) return 0;
  return (checklistCurrentStep.value / activeChecklist.value.steps.length) * 100;
});

const isCurrentStepAutomated = computed(() => {
  if (!activeChecklist.value || checklistCurrentStep.value >= activeChecklist.value.steps.length) {
    return false;
  }
  const currentStep = activeChecklist.value.steps[checklistCurrentStep.value];
  return currentStep.type === 'automated';
});

function toggleChecklistPanel() {
  showChecklistPanel.value = !showChecklistPanel.value;
}

function getStepClasses(index) {
  if (index < checklistCurrentStep.value) {
    return 'border-green-500 bg-green-900/30';
  } else if (index === checklistCurrentStep.value) {
    return 'border-blue-500 bg-blue-900/30';
  } else {
    return 'border-zinc-600 bg-zinc-800';
  }
}

function startChecklist() {
  if (!selectedChecklistId.value) return;
  
  const list = checklists.value.find(l => l.id === selectedChecklistId.value);
  if (!list) return;
  
  activeChecklist.value = list;
  checklistCurrentStep.value = 0;
  checklistError.value = '';
  
  // Start first step if it's automated
  if (isCurrentStepAutomated.value) {
    executeAutomatedStep();
  }
}

function cancelChecklist() {
  activeChecklist.value = null;
  checklistCurrentStep.value = 0;
  checklistError.value = '';
  automatedStepInProgress.value = false;
}

function completeCurrentStep() {
  if (!activeChecklist.value) return;
  
  // Move to next step
  checklistCurrentStep.value++;
  checklistError.value = '';
  
  // If we've reached the end of the checklist
  if (checklistCurrentStep.value >= activeChecklist.value.steps.length) {
    // Show completion message and reset after delay
    setTimeout(() => {
      alert(`${activeChecklist.value.name} completed successfully!`);
      cancelChecklist();
    }, 1000);
    return;
  }
  
  // If next step is automated, execute it
  if (isCurrentStepAutomated.value) {
    executeAutomatedStep();
  }
}

function retryCurrentStep() {
  if (!activeChecklist.value || !isCurrentStepAutomated.value) return;
  
  checklistError.value = '';
  automatedStepInProgress.value = false; // Reset loading state before trying again
  executeAutomatedStep();
}

function executeAutomatedStep() {
  if (!activeChecklist.value) return;
  
  const step = activeChecklist.value.steps[checklistCurrentStep.value];
  console.log(`Executing automated step: ${step.action}`);
  
  // Set the loading state to true
  automatedStepInProgress.value = true;
  
  // Implement the actual automation logic based on step.action
  switch (step.action) {
    case 'startQlc':
      // Example implementation - replace with actual logic
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({
          channel: 'main',
          type: 'startQlc'
        }));
        
        // For demonstration - simulate success/failure
        // In a real implementation, you'd handle this via WebSocket response
        setTimeout(() => {
          automatedStepInProgress.value = false; // Clear loading state
          
          if (Math.random() > 0.2) {
            completeCurrentStep();
          } else {
            checklistError.value = "QLC+ failed to start. Please check if it's already running.";
          }
        }, 2000);
      } else {
        automatedStepInProgress.value = false; // Clear loading state
        checklistError.value = "Cannot communicate with server";
      }
      break;
      
    case 'startLstController':
      // Similar implementation
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({
          channel: 'main',
          type: 'startLstController'
        }));
        
        setTimeout(() => {
          automatedStepInProgress.value = false; // Clear loading state
          
          if (Math.random() > 0.2) {
            completeCurrentStep();
          } else {
            checklistError.value = "LST Controller failed to start. Please check your configuration.";
          }
        }, 2000);
      } else {
        automatedStepInProgress.value = false; // Clear loading state
        checklistError.value = "Cannot communicate with server";
      }
      break;
      
    default:
      automatedStepInProgress.value = false; // Clear loading state
      checklistError.value = `Unknown automated action: ${step.action}`;
  }
}

const automatedStepInProgress = ref(false);


    return {
      connected,
      loading,
      rawCues,
      activeCues,
      selectedCueList,
      currentCueIndex,
      toggleCategory,
      toggleTabs,
      categorizedCues,
      selectedCueListItems,
      nextCue,
      filteredToggleCues,
      refreshFunctions,
      triggerCue,
      toggleCue,
      isActive,
      getCueName,
      getQlcId,
      getCueTypeColor,
      setCurrentCue,
      goNextCue,
      saveTabConfig,
      loadToggleTabsConfig,
      keyboardMacros,
      addKeyboardMacro,
      stopAllCues,
      showKeyboardShortcuts,
      toggleKeyboardShortcutsModal,
      lastPlayedCueId,
      showChecklistPanel,
      checklists,
      selectedChecklistId,
      activeChecklist,
      checklistCurrentStep,
      checklistError,
      currentChecklist,
      checklistProgress,
      isCurrentStepAutomated,
      toggleChecklistPanel,
      getStepClasses,
      startChecklist,
      cancelChecklist,
      completeCurrentStep,
      retryCurrentStep,
      automatedStepInProgress
    };
  }
});
</script>

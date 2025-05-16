<template>
  <div class="md:col-span-2 bg-zinc-800 rounded-sm border-2 border-zinc-700 shadow-lg p-2 flex flex-col overflow-hidden">
    <h2 class="text-lg font-bold font-mono mb-1 uppercase tracking-wide">Function Toggles</h2>
    
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
    
    <div class="overflow-y-auto flex-grow border border-zinc-700 bg-zinc-850 p-1">
      <ActiveCues 
        v-if="toggleCategory === 'Active'"
        :active-cues="activeCues"
        :cues="rawCues"
        @trigger-cue="triggerCue"
      />
      
      <BombButtons
        v-else-if="toggleCategory === 'Bomb'"
        :panel-state="panelState"
        @trigger-custom-action="handleCustomAction"
      />
      
      <ToggleButtons
        v-else
        :cues="filteredToggleCues"
        :active-cues="activeCues"
        @toggle-cue="toggleCue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import type { QlcCue, ToggleTab } from '@/types';
import ActiveCues from '@/components/toggles/ActiveCues.vue';
import ToggleButtons from '@/components/toggles/ToggleButtons.vue';
import BombButtons from '@/components/toggles/BombButtons.vue';

export default defineComponent({
  name: 'FunctionToggles',
  components: {
    ActiveCues,
    ToggleButtons,
    BombButtons
  },
  props: {
    rawCues: {
      type: Array as () => QlcCue[],
      required: true
    },
    activeCues: {
      type: Array as () => string[],
      required: true
    },
    toggleTabs: {
      type: Array as () => ToggleTab[],
      required: true
    },
    panelState: {
      type: Object,
      default: () => ({ active_panels: [], waiting_for_plunger: [] })
    }
  },
  emits: ['triggerCue', 'toggleCue', 'triggerCustomAction'],
  setup(props, { emit }) {
    const toggleCategory = ref('Active');

    const filteredToggleCues = computed(() => {
      if (toggleCategory.value === 'Active' || toggleCategory.value === 'Bomb') return [];
      
      const currentTab = props.toggleTabs.find(tab => tab.name === toggleCategory.value);
      if (!currentTab) return [];
      
      if (currentTab.name === 'All' || currentTab.cues.length === 0) {
        if (currentTab.name === 'BGM') {
          return props.rawCues.filter(cue => cue.id.startsWith('BGM'));
        } else if (currentTab.name === 'Lights') {
          return props.rawCues.filter(cue => cue.id.startsWith('LT'));
        } else if (currentTab.name === 'SFX') {
          return props.rawCues.filter(cue => cue.id.startsWith('SFX'));
        }
        return props.rawCues;
      }
      
      return props.rawCues.filter(cue => {
        return currentTab.cues.some(configCueId => {
          if (configCueId.startsWith('QLC:')) {
            const qlcId = parseInt(configCueId.substring(4));
            return cue.qlcId === qlcId;
          }
          return cue.id === configCueId;
        });
      });
    });

    const triggerCue = (qlcId: number, action: 'start' | 'stop') => emit('triggerCue', qlcId, action);
    const toggleCue = (qlcId: number) => emit('toggleCue', qlcId);
    const handleCustomAction = (payload: any) => emit('triggerCustomAction', payload);

    return {
      toggleCategory,
      filteredToggleCues,
      triggerCue,
      toggleCue,
      handleCustomAction
    };
  }
});
</script>
<template>
  <div class="md:col-span-3 bg-zinc-800 rounded-sm border-2 border-zinc-700 shadow-lg p-2 flex flex-col overflow-hidden">
    <h2 class="text-lg font-bold font-mono mb-1 uppercase tracking-wide">Cue List</h2>
    
    <div class="mb-2">
      <select 
        v-model="selectedList" 
        class="w-full bg-zinc-700 border-2 border-zinc-600 rounded-sm p-2 text-base font-mono focus:outline-none focus:border-blue-500"
      >
        <option v-for="(_, category) in categorizedCues" :key="category" :value="category">
          {{ category }} LIST
        </option>
      </select>
    </div>
    
    <div class="flex-grow overflow-y-auto mb-2 pr-1 border border-zinc-700 bg-zinc-850 p-1 select-none">
      <div class="space-y-4">
        <!-- Current List -->
        <div>
          <div 
            v-for="(cue, index) in selectedCueListItems" 
            :key="cue.id" 
            class="p-2 mb-1 transition-colors border-l-4 border-r border-t border-b cursor-pointer"
            :class="getCueClasses(index, cue)"
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
        </div>

        <!-- Next List Preview -->
        <div v-if="nextList && nextListCues.length > 0" class="pt-2 border-t-2 border-zinc-700">
          <div class="text-sm font-mono text-orange-400 mb-2 uppercase">Next: {{ nextList }} LIST</div>
          <div 
            v-for="cue in nextListCues" 
            :key="cue.id" 
            class="p-2 mb-1 transition-colors border-l-4 border-r border-t border-b bg-zinc-800 border-zinc-700 opacity-50"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="w-2 h-full mr-2 bg-zinc-600"></div>
                <div>
                  <span class="font-mono text-lg text-gray-400 font-bold">{{ cue.id }}</span>
                  <span class="ml-1 font-medium text-lg">{{ cue.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedCueListItems.length === 0" class="text-gray-400 text-center py-4 text-sm font-mono">
        No cues in this list
      </div>
    </div>
    
    <div class="grid grid-cols-5 gap-2 mt-auto">
      <button 
        @click="goNextCue" 
        class="col-span-2 bg-green-800 hover:bg-green-700 text-white font-bold font-mono py-3 px-4 rounded-sm text-xl transition-colors border-2 border-green-600 uppercase flex items-center justify-center gap-2"
      >
        GO <span class="text-2xl">→</span>
      </button>
      
      <div class="col-span-3 bg-zinc-800 border-2 border-zinc-700 rounded-sm p-2">
        <div class="text-xs text-gray-400 uppercase font-bold font-mono">Next:</div>
        <div v-if="nextCue" class="font-bold truncate text-base">
          {{ nextCue.id }} - {{ nextCue.name }}
        </div>
        <div v-else-if="nextList" class="font-bold truncate text-base flex items-center">
          <span class="text-orange-400">→ {{ nextList }} LIST</span>
        </div>
        <div v-else class="font-bold truncate text-base text-gray-500">
          End of show
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { QlcCue } from '@/types';

export default defineComponent({
  name: 'CueList',
  props: {
    categorizedCues: {
      type: Object as () => Record<string, QlcCue[]>,
      required: true
    },
    currentCueIndex: {
      type: Number,
      required: true
    },
    activeCues: {
      type: Array as () => string[],
      required: true
    },
    lastPlayedCueId: {
      type: [String, null],
      default: null
    },
    selectedList: {
      type: String,
      required: true
    }
  },
  emits: ['update:selectedList', 'setCurrentCue', 'triggerCue', 'goNext'],
  setup(props, { emit }) {
    const selectedList = computed({
      get: () => props.selectedList,
      set: (value) => emit('update:selectedList', value)
    });

    const selectedCueListItems = computed(() => {
      return props.categorizedCues[props.selectedList] || [];
    });

    const nextCue = computed(() => {
      if (props.currentCueIndex < selectedCueListItems.value.length - 1) {
        return selectedCueListItems.value[props.currentCueIndex + 1];
      }
      return null;
    });

    const nextList = computed(() => {
      if (!nextCue.value) {
        const lists = Object.keys(props.categorizedCues);
        const currentListIndex = lists.indexOf(props.selectedList);
        if (currentListIndex < lists.length - 1) {
          return lists[currentListIndex + 1];
        }
      }
      return null;
    });

    const nextListCues = computed(() => {
      if (nextList.value) {
        return props.categorizedCues[nextList.value] || [];
      }
      return [];
    });

    const isActive = (cueId: string) => props.activeCues.includes(cueId);

    const getCueClasses = (index: number, cue: QlcCue) => {
      if (props.currentCueIndex === index) {
        return ['bg-blue-900', 'border-blue-500'];
      }
      if (isActive(cue.id)) {
        return ['bg-zinc-800', 'border-green-500'];
      }
      if (props.lastPlayedCueId === cue.id) {
        return ['bg-zinc-800', 'border-orange-500'];
      }
      return ['bg-zinc-800', 'border-zinc-700'];
    };

    const setCurrentCue = (index: number) => emit('setCurrentCue', index);
    const triggerCue = (qlcId: number, action: 'start' | 'stop') => emit('triggerCue', qlcId, action);
    const goNextCue = () => emit('goNext');

    return {
      selectedList,
      selectedCueListItems,
      nextCue,
      nextList,
      nextListCues,
      isActive,
      getCueClasses,
      setCurrentCue,
      triggerCue,
      goNextCue
    };
  }
});
</script>
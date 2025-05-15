<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
    <div 
      v-for="cue in cues" 
      :key="cue.id" 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"
      :class="{ 'ring-1 ring-green-500 bg-zinc-700 border-green-600': isActive(cue.id) }"
      @click="$emit('toggleCue', cue.qlcId)"
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
    
    <div v-if="cues.length === 0" class="text-gray-400 text-center py-4 text-sm font-mono col-span-2">
      No toggles in this category
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { QlcCue } from '@/types';

export default defineComponent({
  name: 'ToggleButtons',
  props: {
    cues: {
      type: Array as () => QlcCue[],
      required: true
    },
    activeCues: {
      type: Array as () => string[],
      required: true
    }
  },
  emits: ['toggleCue'],
  setup(props) {
    const isActive = (cueId: string) => props.activeCues.includes(cueId);

    const getCueTypeColor = (cueId: string) => {
      if (cueId.startsWith('BGM')) return 'bg-purple-400';
      if (cueId.startsWith('LT')) return 'bg-yellow-400';
      if (cueId.startsWith('SFX')) return 'bg-red-400';
      return 'bg-blue-400';
    };

    return {
      isActive,
      getCueTypeColor
    };
  }
});
</script>
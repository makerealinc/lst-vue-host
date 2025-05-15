<template>
  <div>
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
          @click="$emit('triggerCue', getQlcId(cueId), 'stop')" 
          class="ml-1 px-2 py-1 rounded-sm bg-red-800 hover:bg-red-700 flex items-center justify-center font-bold text-xs font-mono border border-red-600"
        >
          STOP
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { QlcCue } from '@/types';

export default defineComponent({
  name: 'ActiveCues',
  props: {
    activeCues: {
      type: Array as () => string[],
      required: true
    },
    cues: {
      type: Array as () => QlcCue[],
      required: true
    }
  },
  emits: ['triggerCue'],
  setup(props) {
    const getQlcId = (cueId: string) => {
      const cue = props.cues.find(c => c.id === cueId);
      return cue ? cue.qlcId : -1;
    };

    const getCueName = (cueId: string) => {
      const cue = props.cues.find(c => c.id === cueId);
      return cue ? cue.name : cueId;
    };

    return {
      getQlcId,
      getCueName
    };
  }
});
</script>
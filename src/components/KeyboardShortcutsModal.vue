<template>
  <div 
    class="fixed inset-0 flex items-center justify-center z-50"
    @click="$emit('close')"
  >
    <div 
      class="absolute inset-0 bg-zinc-900 opacity-60"
    ></div>
    <div 
      class="bg-zinc-800 p-6 rounded-sm border-2 border-zinc-700 shadow-xl max-w-2xl w-full mx-4 relative z-10"
      @click.stop
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold font-mono tracking-wider">KEYBOARD SHORTCUTS</h2>
        <button 
          @click="$emit('close')" 
          class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div class="grid gap-3">
        <div 
          v-for="macro in keyboardMacros" 
          :key="macro.key" 
          class="flex items-center justify-between bg-zinc-900 p-3 border border-zinc-700"
        >
          <span class="font-mono">{{ macro.description }}</span>
          <kbd class="px-2 py-1 bg-zinc-700 border-2 border-zinc-600 rounded-sm text-sm font-mono">{{ macro.key }}</kbd>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { KeyboardMacro } from '@/types';

export default defineComponent({
  name: 'KeyboardShortcutsModal',
  props: {
    keyboardMacros: {
      type: Array as () => KeyboardMacro[],
      required: true
    }
  },
  emits: ['close']
});
</script>
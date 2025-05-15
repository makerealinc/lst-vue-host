<template>
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
      <button 
        @click="toggleChecklist" 
        class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
      >
        CHECKLISTS
      </button>
      <button 
        @click="toggleKeyboardShortcuts" 
        class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
        title="Keyboard Shortcuts"
      >
        ?
      </button>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Header',
  props: {
    connected: {
      type: Boolean,
      required: true
    }
  },
  emits: ['refresh', 'toggleKeyboardShortcuts', 'toggleChecklist'],
  setup(_, { emit }) {
    const refreshFunctions = () => emit('refresh');
    const toggleKeyboardShortcuts = () => emit('toggleKeyboardShortcuts');
    const toggleChecklist = () => emit('toggleChecklist');

    return {
      refreshFunctions,
      toggleKeyboardShortcuts,
      toggleChecklist
    };
  }
});
</script>
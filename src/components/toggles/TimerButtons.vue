<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
    <!-- 60 Second Timer -->
    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col transition-all border-2 border-zinc-600"
      :class="{ 'ring-1 ring-green-500 bg-zinc-700 border-green-600': isTimerActive }"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-blue-400"
            :class="[isTimerActive ? 'animate-pulse' : '']"
          >
            <span class="text-black text-xs font-bold font-mono">TMR</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">TIMER-60</span>
            <div class="w-2 h-2 rounded-none mr-1 border border-zinc-400" 
              :class="isTimerActive ? 'bg-green-500' : 'bg-zinc-500'">
            </div>
          </div>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600" 
          :class="isTimerActive ? 'bg-green-800 border-green-600' : 'bg-zinc-700'">
          {{ isTimerActive ? 'RUNNING' : 'STOPPED' }}
        </span>
      </div>
      <div class="text-center font-mono text-2xl my-2 select-none">
        {{ formatTime(timeRemaining) }}
      </div>
      <div class="flex justify-between mt-1 space-x-2">
        <button 
          class="flex-1 py-1 px-2 text-xs font-bold font-mono border rounded-sm transition-colors"
          :class="[
            isTimerActive 
              ? 'bg-red-700 border-red-600 hover:bg-red-600' 
              : 'bg-green-700 border-green-600 hover:bg-green-600'
          ]"
          @click="isTimerActive ? stopTimer() : startTimer()"
        >
          {{ isTimerActive ? 'STOP' : 'START' }}
        </button>
        <button 
          class="flex-1 py-1 px-2 text-xs font-bold font-mono border rounded-sm bg-zinc-700 border-zinc-600 hover:bg-zinc-600 transition-colors"
          @click="resetTimer()"
          :disabled="isTimerActive"
          :class="{ 'opacity-50 cursor-not-allowed': isTimerActive }"
        >
          RESET
        </button>
      </div>
    </div>

    <!-- Empty placeholder -->
    <div class="bg-zinc-800 rounded-sm p-2 flex flex-col border-2 border-zinc-600 opacity-30">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-zinc-400">
            <span class="text-black text-xs font-bold font-mono">---</span>
          </div>
          <span class="text-xs font-mono">EMPTY</span>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600 bg-zinc-700">
          UNUSED
        </span>
      </div>
      <div class="text-center font-mono text-2xl my-2 select-none text-zinc-600">
        --:--
      </div>
      <div class="flex justify-between mt-1 space-x-2">
        <button class="flex-1 py-1 px-2 text-xs font-mono border rounded-sm bg-zinc-700 border-zinc-600" disabled>START</button>
        <button class="flex-1 py-1 px-2 text-xs font-mono border rounded-sm bg-zinc-700 border-zinc-600" disabled>RESET</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';

export default defineComponent({
  name: 'TimerButtons',
  props: {
    activeCues: {
      type: Array as () => string[],
      required: true
    }
  },
  emits: ['toggleCue', 'timerExpired'],
  setup(props, { emit }) {
    const timeRemaining = ref(60);
    const isTimerActive = ref(false);
    let timerInterval: number | null = null;
    const timerCueId = 249; // The cue ID for the 60 second timer

    // Start the timer and cue
    const startTimer = () => {
      // Start the cue
      emit('toggleCue', timerCueId);
      
      // Start the timer
      isTimerActive.value = true;
      timerInterval = window.setInterval(() => {
        if (timeRemaining.value > 0) {
          timeRemaining.value -= 1;
        } else {
          stopTimer();
          emit('timerExpired', timerCueId);
        }
      }, 1000);
    };

    // Stop the timer and cue
    const stopTimer = () => {
      // Stop the cue
      emit('toggleCue', timerCueId);
      
      // Stop the timer
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      isTimerActive.value = false;
    };

    // Reset the timer (cue should already be stopped)
    const resetTimer = () => {
      // Can only reset when timer is not running
      if (isTimerActive.value) return;
      
      // Reset timer value
      timeRemaining.value = 60;
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Clean up on component unmount
    onUnmounted(() => {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        
        // If timer was running, stop the cue
        if (isTimerActive.value) {
          emit('toggleCue', timerCueId);
        }
      }
    });

    return {
      timeRemaining,
      isTimerActive,
      startTimer,
      stopTimer,
      resetTimer,
      formatTime
    };
  }
});
</script>

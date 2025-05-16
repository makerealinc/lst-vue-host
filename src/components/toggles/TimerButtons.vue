<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
    <!-- 60 Second Timer - Single clickable area -->
    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"
      :class="{ 
        'ring-1 ring-green-500 bg-zinc-700 border-green-600': timerState === 'running',
        'ring-1 ring-yellow-500 bg-zinc-700 border-yellow-600': timerState === 'stopped'
      }"
      @click="handleTimerClick"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-blue-400"
            :class="[timerState === 'running' ? 'animate-pulse' : '']"
          >
            <span class="text-black text-xs font-bold font-mono">TMR</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">TIMER-60</span>
            <div class="w-2 h-2 rounded-none mr-1 border border-zinc-400" 
              :class="{ 
                'bg-green-500': timerState === 'running', 
                'bg-yellow-500': timerState === 'stopped',
                'bg-zinc-500': timerState === 'ready'
              }">
            </div>
          </div>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600" 
          :class="{ 
            'bg-green-800 border-green-600': timerState === 'running',
            'bg-yellow-800 border-yellow-600': timerState === 'stopped',
            'bg-zinc-700': timerState === 'ready'
          }">
          {{ getTimerStatus() }}
        </span>
      </div>
      <div class="text-center font-mono text-2xl my-2 select-none">
        {{ formatTime(timeRemaining) }}
      </div>
      <div class="flex justify-center items-center border border-zinc-600 p-2 rounded-sm mt-1 bg-zinc-700">
        <div class="text-center text-xs font-bold font-mono">
          {{ getNextActionText() }}
        </div>
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
      <div class="flex justify-center items-center border border-zinc-600 p-2 rounded-sm mt-1 bg-zinc-700">
        <div class="text-center text-xs font-mono text-zinc-500">
          NO ACTION
        </div>
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
    const timerState = ref<'ready' | 'running' | 'stopped'>('ready');
    let timerInterval: number | null = null;
    const timerCueId = 249; // The cue ID for the 60 second timer

    // Handle timer click based on current state
    const handleTimerClick = () => {
      if (timerState.value === 'ready') {
        startTimer();
      } else if (timerState.value === 'running') {
        stopTimer();
      } else if (timerState.value === 'stopped') {
        resetTimer();
      }
    };

    // Start the timer and cue
    const startTimer = () => {
      // Start the cue
      emit('toggleCue', timerCueId);
      
      // Start the timer
      timerState.value = 'running';
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
      timerState.value = 'stopped';
    };

    // Reset the timer (cue should already be stopped)
    const resetTimer = () => {
      // Reset timer value
      timeRemaining.value = 60;
      timerState.value = 'ready';
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerStatus = () => {
      if (timerState.value === 'running') return 'RUNNING';
      if (timerState.value === 'stopped') return 'STOPPED';
      return 'READY';
    };

    const getNextActionText = () => {
      if (timerState.value === 'ready') return 'CLICK TO START TIMER';
      if (timerState.value === 'running') return 'CLICK TO STOP TIMER';
      return 'CLICK TO RESET TIMER';
    };

    // Clean up on component unmount
    onUnmounted(() => {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        
        // If timer was running, stop the cue
        if (timerState.value === 'running') {
          emit('toggleCue', timerCueId);
        }
      }
    });

    return {
      timeRemaining,
      timerState,
      handleTimerClick,
      formatTime,
      getTimerStatus,
      getNextActionText
    };
  }
});
</script>
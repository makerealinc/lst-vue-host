<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
    <!-- Debugging info -->
    <!-- <div v-if="debugMode" class="col-span-2 bg-zinc-900 p-2 mb-2 text-xs font-mono">
      <div>Found Timer Cues: {{ debugTimerCount }}</div>
      <div>Active Cues: {{ activeCues.join(', ') }}</div>
    </div> -->

    <!-- Dynamic Timer Buttons -->
    <div 
      v-for="timer in timers" 
      :key="timer.cueId"
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"
      :class="{ 
        'ring-1 ring-green-500 bg-zinc-700 border-green-600': timer.state === 'running',
        'ring-1 ring-yellow-500 bg-zinc-700 border-yellow-600': timer.state === 'stopped'
      }"
      @click="handleTimerClick(timer)"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-blue-400"
            :class="[timer.state === 'running' ? 'animate-pulse' : '']"
          >
            <span class="text-black text-xs font-bold font-mono">TMR</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">{{ timer.cueId }}</span>
            <div class="w-2 h-2 rounded-none mr-1 border border-zinc-400" 
              :class="{ 
                'bg-green-500': timer.state === 'running', 
                'bg-yellow-500': timer.state === 'stopped',
                'bg-zinc-500': timer.state === 'ready'
              }">
            </div>
          </div>
        </div>
        <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600" 
          :class="{ 
            'bg-green-800 border-green-600': timer.state === 'running',
            'bg-yellow-800 border-yellow-600': timer.state === 'stopped',
            'bg-zinc-700': timer.state === 'ready'
          }">
          {{ getTimerStatus(timer) }}
        </span>
      </div>
      <div class="text-sm font-mono mb-1 break-words">{{ timer.name }}</div>
      <div class="text-center font-mono text-2xl my-1 select-none">
        {{ formatTime(timer.timeRemaining) }}
      </div>
      <div class="flex justify-center items-center border border-zinc-600 p-1 rounded-sm mt-1 bg-zinc-700">
        <div class="text-center text-xs font-bold font-mono">
          {{ getNextActionText(timer) }}
        </div>
      </div>
    </div>
    
    <div v-if="timers.length === 0" class="text-gray-400 text-center py-4 text-sm font-mono col-span-2">
      No timer cues found. Make sure timer cues follow the format "TIMER-XX".
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, onMounted, watch, computed } from 'vue';
import type { QlcCue } from '@/types';

interface Timer {
  cueId: number;
  id: string;
  name: string;
  duration: number;
  timeRemaining: number;
  state: 'ready' | 'running' | 'stopped';
  interval: number | null;
}

export default defineComponent({
  name: 'TimerButtons',
  props: {
    activeCues: {
      type: Array as () => string[],
      required: true
    },
    cues: {
      type: Array as () => QlcCue[],
      required: true,
      default: () => []
    }
  },
  emits: ['toggleCue', 'timerExpired'],
  setup(props, { emit }) {
    const timers = ref<Timer[]>([]);
    const debugMode = ref(true); // Set to false in production
    
    // For debugging
    const debugTimerCount = computed(() => timers.value.length);
    
    // Extract seconds from time string like "60s" or "90s"
    const extractSeconds = (timeStr: string): number => {
      const matches = timeStr.match(/(\d+)s/);
      if (matches && matches[1]) {
        return parseInt(matches[1]);
      }
      return 60; // Default to 60 seconds if no match
    };
    
    // Find all timer cues in the list
    const findTimerCues = () => {
      console.log("Finding timer cues from", props.cues.length, "total cues");
      const foundTimers: Timer[] = [];
      
      props.cues.forEach(cue => {
        try {
          // Check if the ID starts with "TIMER-"
          if (cue.id && cue.id.startsWith('TIMER-')) {
            console.log("Found potential timer cue:", cue);
            
            // Extract duration from name (e.g., "60s Chill")
            const duration = extractSeconds(cue.name);
            
            if (duration > 0) {
              foundTimers.push({
                cueId: cue.qlcId,
                id: cue.id,
                name: cue.name || cue.id,
                duration: duration,
                timeRemaining: duration,
                state: 'ready',
                interval: null
              });
              console.log(`Added timer: ${cue.id}, duration: ${duration}s, name: ${cue.name}`);
            }
          }
        } catch (error) {
          console.error("Error processing cue:", error, cue);
        }
      });
      
      console.log(`Found ${foundTimers.length} timer cues`);
      return foundTimers;
    };
    
    // Update timers list, preserving state of existing timers
    const updateTimers = () => {
      const newTimers = findTimerCues();
      
      // Transfer state from existing timers
      newTimers.forEach(newTimer => {
        const existingTimer = timers.value.find(t => t.cueId === newTimer.cueId);
        if (existingTimer) {
          newTimer.state = existingTimer.state;
          newTimer.timeRemaining = existingTimer.timeRemaining;
          newTimer.interval = existingTimer.interval;
        }
      });
      
      // Clear intervals for timers that are being removed
      timers.value.forEach(oldTimer => {
        if (!newTimers.some(t => t.cueId === oldTimer.cueId) && oldTimer.interval) {
          clearInterval(oldTimer.interval);
        }
      });
      
      timers.value = newTimers;
    };
    
    // Handle timer click based on current state
    const handleTimerClick = (timer: Timer) => {
      if (timer.state === 'ready') {
        startTimer(timer);
      } else if (timer.state === 'running') {
        stopTimer(timer);
      } else if (timer.state === 'stopped') {
        resetTimer(timer);
      }
    };

    // Start the timer and cue
    const startTimer = (timer: Timer) => {
      console.log(`Starting timer for cue ${timer.id} (${timer.cueId})`);
      
      // Start the cue
      emit('toggleCue', timer.cueId);
      
      // Start the timer
      timer.state = 'running';
      timer.interval = window.setInterval(() => {
        if (timer.timeRemaining > 0) {
          // Create a new reference to trigger reactivity
          const index = timers.value.findIndex(t => t.cueId === timer.cueId);
          if (index !== -1) {
            const updatedTimer = { ...timers.value[index] };
            updatedTimer.timeRemaining -= 1;
            timers.value[index] = updatedTimer;
          }
        } else {
          stopTimer(timer);
          emit('timerExpired', timer.cueId);
        }
      }, 1000);
    };
    // Stop the timer and cue
    const stopTimer = (timer: Timer) => {
      console.log(`Stopping timer for cue ${timer.id} (${timer.cueId})`);
      
      // Stop the cue
      emit('toggleCue', timer.cueId);
      
      // Stop the timer
      if (timer.interval !== null) {
        clearInterval(timer.interval);
        timer.interval = null;
      }
      timer.state = 'stopped';
    };

    // Reset the timer (cue should already be stopped)
    const resetTimer = (timer: Timer) => {
      console.log(`Resetting timer for cue ${timer.id} (${timer.cueId})`);
      
      // Reset timer value
      timer.timeRemaining = timer.duration;
      timer.state = 'ready';
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerStatus = (timer: Timer) => {
      if (timer.state === 'running') return 'RUNNING';
      if (timer.state === 'stopped') return 'STOPPED';
      return 'READY';
    };

    const getNextActionText = (timer: Timer) => {
      if (timer.state === 'ready') return 'CLICK TO START';
      if (timer.state === 'running') return 'CLICK TO STOP';
      return 'CLICK TO RESET';
    };
    
    // Watch cues to update timer list
    watch(() => props.cues, () => {
      console.log("Cues changed, updating timer list");
      updateTimers();
    }, { deep: true });

    // Initialize timers on component mount
    onMounted(() => {
      console.log("TimerButtons mounted");
      console.log("Available cues:", props.cues.map(c => `${c.id} (${c.name})`).join(', '));
      updateTimers();
    });

    // Clean up all intervals on component unmount
    onUnmounted(() => {
      console.log("TimerButtons unmounted, cleaning up");
      timers.value.forEach(timer => {
        if (timer.interval !== null) {
          clearInterval(timer.interval);
          
          // If timer was running, stop the cue
          if (timer.state === 'running') {
            emit('toggleCue', timer.cueId);
          }
        }
      });
    });

    return {
      timers,
      debugMode,
      debugTimerCount,
      handleTimerClick,
      formatTime,
      getTimerStatus,
      getNextActionText
    };
  }
});
</script>

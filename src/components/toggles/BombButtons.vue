<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-0.5">
    <!-- Drop buttons -->
    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"

      :class="{ 
        'ring-1 ring-green-500 bg-zinc-700 border-green-600': isPanelActive(1),
        'ring-1 ring-yellow-500 bg-zinc-700 border-yellow-600': isPanelWaitingForPlunger(1)
      }"
      @click="sendDropMessage(1)"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-blue-400"

            :class="[isPanelActive(1) ? 'animate-pulse' : '', isPanelWaitingForPlunger(1) ? 'animate-pulse bg-yellow-400' : '']"
          >
            <span class="text-black text-xs font-bold font-mono">PNL</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">DROP-1</span>

            <div class="w-2 h-2 rounded-none mr-1 border border-zinc-400" 
              :class="{ 
                'bg-green-500': isPanelActive(1), 
                'bg-yellow-500': isPanelWaitingForPlunger(1),
                'bg-zinc-500': !isPanelActive(1) && !isPanelWaitingForPlunger(1)
              }">
            </div>
          </div>
        </div>


        <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600" 
          :class="{ 
            'bg-green-800 border-green-600': isPanelActive(1),
            'bg-yellow-800 border-yellow-600': isPanelWaitingForPlunger(1),
            'bg-zinc-700': !isPanelActive(1) && !isPanelWaitingForPlunger(1)
          }">
          {{ getPanelStatus(1) }}
        </span>
      </div>
      <div class="text-sm font-mono break-words">DROP PANEL ONE</div>
    </div>

    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"

      :class="{ 
        'ring-1 ring-green-500 bg-zinc-700 border-green-600': isPanelActive(2),
        'ring-1 ring-yellow-500 bg-zinc-700 border-yellow-600': isPanelWaitingForPlunger(2)
      }"
      @click="sendDropMessage(2)"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-green-400"

            :class="[isPanelActive(2) ? 'animate-pulse' : '', isPanelWaitingForPlunger(2) ? 'animate-pulse bg-yellow-400' : '']"
          >
            <span class="text-black text-xs font-bold font-mono">PNL</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">DROP-2</span>

            <div class="w-2 h-2 rounded-none mr-1 border border-zinc-400" 
              :class="{ 
                'bg-green-500': isPanelActive(2), 
                'bg-yellow-500': isPanelWaitingForPlunger(2),
                'bg-zinc-500': !isPanelActive(2) && !isPanelWaitingForPlunger(2)
              }">
            </div>
          </div>
        </div>


        <span class="text-xs font-mono px-2 py-0.5 border border-zinc-600" 
          :class="{ 
            'bg-green-800 border-green-600': isPanelActive(2),
            'bg-yellow-800 border-yellow-600': isPanelWaitingForPlunger(2),
            'bg-zinc-700': !isPanelActive(2) && !isPanelWaitingForPlunger(2)
          }">
          {{ getPanelStatus(2) }}
        </span>
      </div>
      <div class="text-sm font-mono break-words">DROP PANEL TWO</div>
    </div>
    
    <!-- Reset buttons -->
    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"
      @click="sendResetMessage(1)"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-blue-300"
          >
            <span class="text-black text-xs font-bold font-mono">RST</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">RESET-1</span>
          </div>
        </div>
      </div>
      <div class="text-sm font-mono break-words">RESET PANEL ONE</div>
    </div>

    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700"
      @click="sendResetMessage(2)"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-green-300"
          >
            <span class="text-black text-xs font-bold font-mono">RST</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">RESET-2</span>
          </div>
        </div>
      </div>
      <div class="text-sm font-mono break-words">RESET PANEL TWO</div>
    </div>
    
    <!-- Reset All button -->
    <div 
      class="bg-zinc-800 rounded-sm p-2 flex flex-col cursor-pointer transition-all border-2 border-zinc-600 hover:bg-zinc-700 col-span-1 sm:col-span-2"
      @click="sendResetAllMessage"
    >
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center">
          <div 
            class="w-8 h-8 rounded-sm mr-2 flex items-center justify-center flex-shrink-0 border border-black bg-red-400"
          >
            <span class="text-black text-xs font-bold font-mono">ALL</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs font-mono mr-1">RESET-ALL</span>
          </div>
        </div>
      </div>
      <div class="text-sm font-mono break-words">RESET ALL PANELS</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  panelState: {
    type: Object,
    default: () => ({ 
      active_panels: [], 
      waiting_for_plunger: [] 
    })
  }
});

const emit = defineEmits(['triggerCustomAction']);
const activePanels = ref<number[]>([]);
const waitingForPlunger = ref<number[]>([]);

// Watch for changes in the panelState prop
watch(() => props.panelState, (newState) => {
  if (newState) {
    activePanels.value = newState.active_panels || [];
    waitingForPlunger.value = newState.waiting_for_plunger || [];
    console.log('Panel state updated:', newState);
  }
}, { deep: true, immediate: true });

// Send a message to activate a drop panel
const sendDropMessage = (target: number) => {
  emit('triggerCustomAction', {
    event: 'set',
    type: 'activate',
    target: 'drop_panels',
    panel: target
  });
  console.log(`Sent message for target: ${target}`);
};

// Send a message to reset a specific panel
const sendResetMessage = (target: number) => {
  emit('triggerCustomAction', {
    event: 'set',
    type: 'reset',
    target: 'drop_panels',
    panel: target
  });
  console.log(`Sent reset message for target: ${target}`);
};

// Send a message to reset all panels
const sendResetAllMessage = () => {
  emit('triggerCustomAction', {
    event: 'set',
    type: 'reset',
    target: 'drop_panels',
  });
  console.log('Sent reset all message');
};

// Send a message to request current panel states
const requestPanelStates = () => {
  emit('triggerCustomAction', {
    event: 'get',
    target: 'drop_panels'
  });
  console.log('Requested panel states');
};

// Check if a panel is active (fully dropped)
const isPanelActive = (panelId: number) => {
  return activePanels.value.includes(panelId);
};

// Check if a panel is waiting for plunger
const isPanelWaitingForPlunger = (panelId: number) => {
  return waitingForPlunger.value.includes(panelId);
};

// Get panel status text
const getPanelStatus = (panelId: number) => {
  if (isPanelActive(panelId)) return 'ACTIVE';
  if (isPanelWaitingForPlunger(panelId)) return 'WAITING';
  return 'IDLE';
};

// Request initial state when component is mounted
onMounted(() => {
  requestPanelStates();
});
</script>
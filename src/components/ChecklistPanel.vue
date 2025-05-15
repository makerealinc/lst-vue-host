<template>
  <div 
    class="fixed inset-0 flex items-center justify-center"
    @click="$emit('close')"
  >
    <div 
      class="absolute inset-0 bg-zinc-900 opacity-60"
    ></div>
    <div 
      class="bg-zinc-800 p-6 rounded-sm border-2 border-zinc-700 shadow-xl max-w-2xl w-full mx-4 relative z-10"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold font-mono tracking-wider">CHECKLISTS</h2>
        <button 
          @click="$emit('close')" 
          class="px-3 py-1 text-sm font-bold font-mono bg-zinc-700 hover:bg-zinc-600 border-2 border-zinc-600 rounded-sm transition-colors"
        >
          ✕
        </button>
      </div>

      <div v-if="!selectedChecklist && !activeChecklist" class="space-y-4">
        <div 
          v-for="list in checklists" 
          :key="list.id"
          class="p-4 bg-zinc-900 border-2 border-zinc-700 rounded-sm hover:bg-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
          @click="selectChecklist(list)"
        >
          <h3 class="text-lg font-medium font-mono">{{ list.name }}</h3>
          <p class="text-sm text-gray-400 font-mono mt-1">{{ list.steps.length }} steps</p>
        </div>
      </div>

      <div v-else-if="selectedChecklist && !activeChecklist" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-medium font-mono">{{ selectedChecklist.name }}</h3>
          <button 
            @click="selectedChecklist = null"
            class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-sm text-sm font-mono border-2 border-zinc-600"
          >
            BACK
          </button>
        </div>

        <div class="space-y-4">
          <div 
            v-for="(step, index) in selectedChecklist.steps" 
            :key="index"
            class="p-4 rounded-sm border-2 bg-zinc-900 border-zinc-700"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <h4 class="font-medium font-mono">{{ step.name }}</h4>
                <span v-if="step?.required" class="text-xs text-red-400 font-mono">(Required)</span>
              </div>
              <span 
                v-if="step?.type === 'automated'"
                class="text-xs bg-blue-800 border border-blue-600 px-2 py-1 rounded-sm font-mono"
              >
                AUTOMATED
              </span>
            </div>
            <p class="text-sm text-gray-400 mt-1 font-mono">{{ step.description }}</p>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button 
            @click="startSelectedChecklist"
            class="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-sm font-mono border-2 border-green-600"
          >
            START CHECKLIST
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-medium font-mono">{{ activeChecklist?.name }}</h3>
          <button 
            v-if="!isComplete"
            @click="$emit('cancel')"
            class="px-3 py-1 bg-red-800 hover:bg-red-700 rounded-sm text-sm font-mono border-2 border-red-600"
          >
            CANCEL
          </button>
        </div>

        <div v-if="isComplete" class="p-4 bg-green-900 border-2 border-green-600 rounded-sm mb-4">
          <p class="font-mono text-green-100">{{ activeChecklist?.name }} completed successfully!</p>
        </div>

        <div class="space-y-4">
          <div 
            v-for="(step, index) in activeChecklist?.steps" 
            :key="index"
            :class="[
              'p-4 rounded-sm border-2 relative',
              index === currentStep && error ? 'bg-red-900 border-red-600' : 
              index === currentStep ? 'bg-blue-900 border-blue-600' :
              index < currentStep && !step?.skipped ? 'bg-zinc-900 border-green-600' :
              'bg-zinc-900 border-zinc-700'
            ]"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div 
                  :class="[
                    'w-6 h-6 border-2 rounded-sm flex items-center justify-center',
                    index < currentStep && !step?.skipped ? 'border-green-500 bg-green-900' : 'border-zinc-600'
                  ]"
                >
                  <Icon 
                    v-if="index < currentStep" 
                    :icon="step?.skipped ? 'mdi:close' : 'mdi:check'"
                    :class="[step?.skipped ? 'text-zinc-500' : 'text-green-500']"
                  />
                </div>
                <h4 :class="[
                  'font-medium font-mono',
                  step?.skipped ? 'line-through text-gray-500' : (index < currentStep ? 'text-green-400' : '')
                ]">
                  {{ step?.name }}
                </h4>
                <span v-if="step?.required" class="text-xs text-red-400 font-mono">(Required)</span>
              </div>
              <span 
                v-if="step?.type === 'automated'"
                class="text-xs bg-blue-800 border border-blue-600 px-2 py-1 rounded-sm font-mono"
              >
                AUTOMATED
              </span>
            </div>
            <p :class="[
              'text-sm mt-1 font-mono',
              step?.skipped ? 'line-through text-gray-500' : (index < currentStep ? 'text-green-300' : 'text-gray-400')
            ]">
              {{ step?.description }}
            </p>
            <div v-if="index === currentStep && error" class="mt-2 text-red-400 font-mono text-sm">
              {{ error }}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            v-if="isComplete"
            @click="$emit('cancel')"
            class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-sm font-mono border-2 border-zinc-600"
          >
            RETURN TO CHECKLISTS
          </button>
          <template v-else-if="currentStep < (activeChecklist?.steps?.length ?? 0)">
            <button
              v-if="activeChecklist?.steps[currentStep]?.type === 'automated'"
              :disabled="automatedStepInProgress"
              @click="error ? $emit('retry-step') : null"
              class="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-sm font-mono border-2 border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ error ? 'RETRY' : (automatedStepInProgress ? 'PROCESSING...' : 'PROCESSING') }}
            </button>
            <button
              v-if="!activeChecklist?.steps[currentStep]?.required"
              @click="skipCurrentStep"
              class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-sm font-mono border-2 border-zinc-600"
            >
              SKIP
            </button>
            <button
              v-if="activeChecklist?.steps[currentStep]?.type !== 'automated'"
              @click="$emit('complete-step')"
              class="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-sm font-mono border-2 border-green-600"
            >
              COMPLETE STEP
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import type { Checklist } from '@/types';

export default defineComponent({
  name: 'ChecklistPanel',
  components: {
    Icon
  },
  props: {
    checklists: {
      type: Array as () => Checklist[],
      required: true
    },
    activeChecklist: {
      type: Object as () => Checklist | null,
      default: null
    },
    currentStep: {
      type: Number,
      default: 0
    },
    error: {
      type: String,
      default: ''
    },
    automatedStepInProgress: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'start', 'cancel', 'complete-step', 'retry-step'],
  setup(props, { emit }) {
    const selectedChecklist = ref<Checklist | null>(null);

    const isComplete = computed(() => {
      return props.activeChecklist && props.currentStep >= props.activeChecklist.steps.length;
    });

    const isLastStep = computed(() => {
      return props.activeChecklist && props.currentStep === props.activeChecklist.steps.length - 1;
    });

    const selectChecklist = (checklist: Checklist) => {
      selectedChecklist.value = checklist;
    };

    const startSelectedChecklist = () => {
      if (selectedChecklist.value) {
        emit('start', selectedChecklist.value.id);
        selectedChecklist.value = null;
      }
    };

    const skipCurrentStep = () => {
      if (props.activeChecklist?.steps[props.currentStep]) {
        props.activeChecklist.steps[props.currentStep].skipped = true;
      }
      emit('complete-step');
    };

    return {
      selectedChecklist,
      selectChecklist,
      startSelectedChecklist,
      isComplete,
      isLastStep,
      skipCurrentStep
    };
  }
});
</script>
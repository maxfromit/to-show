<script setup lang="ts">
import type { AllCardExpandState } from 'src/pages/components/DashBoard/composables/useCardsState'

defineProps<{
  allCardExpandState?: AllCardExpandState
}>()

const emit = defineEmits<{
  (e: 'change-expand'): void
}>()
</script>

<template>
  <VueThemer>
    <q-btn
      v-if="allCardExpandState != 'all-nothing-to-show'"
      fab
      :icon="
        allCardExpandState === 'all-possible-expanded'
          ? 'svguse:/icons.svg#minimize'
          : 'svguse:/icons.svg#maximize'
      "
      color="secondary"
      @click="emit('change-expand')"
    >
      <q-tooltip theme="extra.delayShorterWidth">
        <div>
          {{
            allCardExpandState === 'all-possible-expanded'
              ? 'Свернуть все карточки'
              : 'Развернуть все карточки'
          }}
        </div>
      </q-tooltip>
    </q-btn>
  </VueThemer>
</template>

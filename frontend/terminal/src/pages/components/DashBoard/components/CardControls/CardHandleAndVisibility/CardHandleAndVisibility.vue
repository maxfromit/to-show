<script setup lang="ts">
import type { VisibilityState } from 'src/pages/components/DashBoard/types'

const initialState = 'shown' as VisibilityState

const visibilityState = defineModel<VisibilityState>({
  default: initialState,
})

function toggleVisibility() {
  visibilityState.value = visibilityState.value === 'shown' ? 'hidden' : 'shown'
}
</script>

<template>
  <VueThemer>
    <q-icon
      name="svguse:/icons.svg#hamburger-menu"
      class="drag-handle"
      size="sm"
      left
      color="accent"
    />
    <q-btn
      theme="table.action"
      dense
      padding="none"
      :icon="
        visibilityState === 'shown'
          ? 'svguse:/eyes.svg#eye'
          : 'svguse:/eyes.svg#eye-off'
      "
      color="accent"
      @click="toggleVisibility"
    />
  </VueThemer>
</template>

<style scoped lang="scss">
.drag-handle {
  cursor: grab;
}
</style>

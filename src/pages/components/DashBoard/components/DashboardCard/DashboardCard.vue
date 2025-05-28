<script setup lang="ts">
import { watch } from 'vue'
import type { ExpandState } from 'src/pages/components/DashBoard/types'

const props = defineProps<{
  mobile?: boolean
  totalEntityCount?: number
  expandedMode?: boolean
  tallTable?: boolean
}>()

const standardHeightStyle = 'height: 15rem'
const initialState = 'collapsed'

const expandState = defineModel<ExpandState>('expandState', {
  default: initialState,
})

function changeExpandState() {
  if (expandState.value === 'collapsed') {
    expandState.value = 'expanded'
    return
  }
  if (expandState.value === 'expanded') {
    expandState.value = 'collapsed'
    return
  }
}

watch(
  () => props.totalEntityCount,
  () => {
    if (!props.totalEntityCount && props.totalEntityCount === null) {
      expandState.value = initialState
      return
    }

    if (!props.totalEntityCount) {
      expandState.value = 'nothing-to-show'
      return
    }
  },
  { immediate: true },
)
</script>

<template>
  <VueThemer>
    <q-card
      class="column"
      :style="!mobile ? 'width: 25rem' : ''"
    >
      <slot name="card-controls"></slot>
      <q-card-section class="column col-grow">
        <div class="column q-gutter-md">
          <div class="column">
            <div class="justify-between items-start row no-wrap q-gutter-x-xs">
              <div class="text-h6 text-uppercase">
                <slot name="header"> </slot>
              </div>

              <q-btn
                v-if="!expandedMode && expandState !== 'nothing-to-show'"
                theme="table.action"
                dense
                padding="none"
                :icon="
                  expandState === 'collapsed'
                    ? 'svguse:/icons.svg#alt-arrow-down'
                    : 'svguse:/icons.svg#alt-arrow-up'
                "
                @click="changeExpandState()"
              />
            </div>
            <slot name="detailed"> </slot>
          </div>

          <slot name="filter"> </slot>

          <q-scroll-area
            v-if="expandedMode"
            :style="tallTable ? 'height: 20rem' : standardHeightStyle"
          >
            <slot name="table"> </slot>
          </q-scroll-area>

          <q-slide-transition v-if="!expandedMode && totalEntityCount">
            <div v-show="expandState === 'expanded'">
              <q-scroll-area :style="standardHeightStyle">
                <slot name="table"> </slot>
              </q-scroll-area>
            </div>
          </q-slide-transition>
        </div>
      </q-card-section>
    </q-card>
  </VueThemer>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { ExpandState } from 'src/pages/components/DashBoard/types'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'

const isCustomizing = inject('customization-state')

defineProps<{
  mobile?: boolean
  isEmptyState?: boolean
  expandedMode?: boolean
  withDownloadButton?: boolean
  tallTable?: boolean
}>()

const initialState = 'collapsed'
const expandState = defineModel<ExpandState>('expandState', {
  default: initialState,
})

const emit = defineEmits<{
  (e: 'download-table'): void
}>()

const standardHeightStyle = 'height: 15rem'

const { toggleExpand } = useExpandState(expandState)
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
              <div class="row items-center q-gutter-sm no-wrap">
                <q-btn
                  v-if="expandState === 'expanded' && withDownloadButton"
                  theme="table.action"
                  icon="svguse:/icons.svg#download"
                  padding="none"
                  @click="emit('download-table')"
                >
                  <q-tooltip theme="extra.delayWidth">
                    Скачать таблицу
                  </q-tooltip>
                </q-btn>

                <q-btn
                  v-if="!expandedMode && (!isEmptyState || isCustomizing)"
                  theme="table.action"
                  :color="isCustomizing ? 'accent' : undefined"
                  dense
                  padding="none"
                  :icon="
                    expandState === 'collapsed'
                      ? 'svguse:/icons.svg#alt-arrow-down'
                      : 'svguse:/icons.svg#alt-arrow-up'
                  "
                  @click="toggleExpand()"
                />
              </div>
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

          <q-slide-transition
            v-if="!expandedMode && (!isEmptyState || isCustomizing)"
          >
            <div v-show="expandState === 'expanded'">
              <div
                v-show="isCustomizing"
                class="text-center text-bold text-accent q-pa-md"
              >
                Карточка будет по умолчанию раскрываться, если будут данные для
                отображения
              </div>
              <q-scroll-area
                v-show="!isCustomizing"
                :style="standardHeightStyle"
              >
                <slot name="table"> </slot>
              </q-scroll-area>
            </div>
          </q-slide-transition>
        </div>
      </q-card-section>
    </q-card>
  </VueThemer>
</template>

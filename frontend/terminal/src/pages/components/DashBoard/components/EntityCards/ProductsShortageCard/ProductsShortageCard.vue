<script setup lang="ts">
import { ref } from 'vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import ProductsShortageTable from 'src/pages/components/DashBoard/ProductsShortage/ProductsShortageTable/ProductsShortageTable.vue'
import ProductsShortageFilterButtons from 'src/pages/components/DashBoard/ProductsShortage/ProductsShortageFilterButtons.vue'

import { getDaysFromNowLabel } from 'src/pages/components/DashBoard/utils/getDaysFromNowLabel'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '

import type { ExpandState } from 'src/pages/components/DashBoard/types'

defineProps<{
  mobile?: boolean
  daysFromNow?: number
  // productStatuses?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:product-statuses', statuses: string[]): void
  (e: 'update:days-from-now', days?: number): void
  (e: 'update:days-to-shift', days?: number): void
}>()

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
})

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

const isTableDownloadingTriggered = ref(false)
function triggerDownload() {
  isTableDownloadingTriggered.value = true
}

const { toggleExpand, expandAndEmit } = useExpandState(expandState)
const { setIsEmptyFromCount } = useIsEmptyState(isEmptyState)
</script>

<template>
  <VueThemer>
    <DashboardCard
      :mobile="mobile"
      :is-empty-state="isEmptyState"
      v-model:expand-state="expandState"
      @download-table="triggerDownload()"
      withDownloadButton
    >
      <template #card-controls>
        <slot name="card-controls"></slot>
      </template>

      <template #header> Дефицитные позиции в договорах и исполнено</template>

      <template #detailed>
        <div>
          Дедлайн:
          <span style="font-weight: bold">
            {{ getDaysFromNowLabel(daysFromNow) }}</span
          >
        </div>
      </template>

      <template #filter>
        <!-- <ProductsShortageFilterButtons
          :productStatuses="productStatuses"
          :days-from-now="daysFromNow"
          @update:product-statuses="
            (val) => emit('update:product-statuses', val)
          "
          @update:days-from-now="(val) => emit('update:days-from-now', val)"
          @total-product-with-shortage-count="getTotalCount"
          @button-click="toggleExpand"

      /> -->
        <ProductsShortageFilterButtons
          :days-from-now="daysFromNow"
          @update:days-from-now="
            (val) => expandAndEmit(() => emit('update:days-from-now', val))
          "
          @total-count="setIsEmptyFromCount"
          @button-click="toggleExpand"
        />
      </template>

      <template #table>
        <!-- <ProductsShortageTable
          :productStatuses="productStatuses"
          :days-from-now="daysFromNow"
        /> -->
        <ProductsShortageTable
          :days-from-now="daysFromNow"
          v-model:is-table-downloading-triggered="isTableDownloadingTriggered"
        />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

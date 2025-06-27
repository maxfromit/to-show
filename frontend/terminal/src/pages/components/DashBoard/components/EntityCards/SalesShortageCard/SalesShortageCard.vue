<script setup lang="ts">
import l from 'lodash'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import SalesShortageTable from 'src/pages/components/DashBoard/SalesShortage/SalesShortageTable.vue'
import SalesShortageFilterButtons from 'src/pages/components/DashBoard/SalesShortage/SalesShortageFilterButtons.vue'

import { pluralDays } from 'src/pages/sales/utils/plural'
import { getDaysFromNowLabel } from 'src/pages/components/DashBoard/utils/getDaysFromNowLabel'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '

import type { ExpandState } from 'src/pages/components/DashBoard/types'

defineProps<{
  mobile?: boolean
  saleStatuses?: string[]
  daysFromNow?: number
  daysToShift?: number
  saleItemStatuses?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:sale-statuses', statuses: string[]): void
  (e: 'update:sale-item-statuses', statuses: string[]): void
  (e: 'update:days-from-now', days?: number): void
  (e: 'update:days-to-shift', days?: number): void
}>()

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
})

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

const { expandAndEmit } = useExpandState(expandState)
const { setIsEmptyFromCount } = useIsEmptyState(isEmptyState)
</script>

<template>
  <VueThemer>
    <DashboardCard
      :mobile="mobile"
      :is-empty-state="isEmptyState"
      v-model:expand-state="expandState"
    >
      <template #card-controls>
        <slot name="card-controls"></slot>
      </template>

      <template #header> Дефицитные заказы </template>

      <template #detailed>
        <div>
          Дедлайн:
          <span style="font-weight: bold">
            {{ getDaysFromNowLabel(daysFromNow) }}</span
          >
        </div>
        <div>
          Оценка дефицита:
          <span style="font-weight: bold">{{
            !!daysToShift && l.toNumber(daysToShift) !== 0
              ? `${
                  l.toNumber(daysToShift) > 0
                    ? `через ${Math.abs(l.toNumber(daysToShift))} ${pluralDays(l.toNumber(daysToShift))} после дедлайна`
                    : `за ${Math.abs(l.toNumber(daysToShift))} ${pluralDays(l.toNumber(daysToShift))} до дедлайна`
                }`
              : 'в день дедлайна '
          }}</span>
        </div>
      </template>

      <template #filter>
        <SalesShortageFilterButtons
          :sale-statuses="saleStatuses"
          :saleItemStatuses="saleItemStatuses"
          :days-from-now="daysFromNow"
          :days-to-shift="daysToShift"
          @update:sale-statuses="
            (val) => expandAndEmit(() => emit('update:sale-statuses', val))
          "
          @update:sale-item-statuses="
            (val) => expandAndEmit(() => emit('update:sale-item-statuses', val))
          "
          @update:days-from-now="
            (val) => expandAndEmit(() => emit('update:days-from-now', val))
          "
          @update:days-to-shift="
            (val) => expandAndEmit(() => emit('update:days-to-shift', val))
          "
          @total-count="setIsEmptyFromCount"
      /></template>

      <template #table>
        <SalesShortageTable
          :sale-statuses="saleStatuses"
          :saleItemStatuses="saleItemStatuses"
          :days-from-now="daysFromNow"
          :days-to-shift="daysToShift"
        />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

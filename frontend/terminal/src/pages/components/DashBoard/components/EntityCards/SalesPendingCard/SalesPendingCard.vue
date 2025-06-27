<script setup lang="ts">
import { ref } from 'vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import SalesPendingTable from 'src/pages/components/DashBoard/SalesPending/SalesPendingTable.vue'
import SalesPendingFilterButtons from 'src/pages/components/DashBoard/SalesPending/SalesPendingFilterButtons.vue'

import OpenWhereSaleInMenu from 'src/pages/components/OpenWhereSaleInMenu/OpenWhereSaleInMenu.vue'

import { getDaysFromNowLabel } from 'src/pages/components/DashBoard/utils/getDaysFromNowLabel'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '

import type { ExpandState } from 'src/pages/components/DashBoard/types'
import type { Sale_Bool_Exp } from 'src/gql/graphql'

defineProps<{
  mobile?: boolean
  saleStatuses?: string[]
  daysFromNow?: number
  saleItemStatuses?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:sale-statuses', statuses: string[]): void
  (e: 'update:sale-item-statuses', statuses: string[]): void
  (e: 'update:days-from-now', days?: number): void
}>()

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
})

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

const selectedSaleIds = ref<number[]>([])
const whereSale = ref<Sale_Bool_Exp>({})

function setSelectedSaleIds(ids: number[] | null) {
  selectedSaleIds.value = ids ?? []
}

function setWhereSale(val: Sale_Bool_Exp) {
  whereSale.value = val
}

const { expandAndEmit } = useExpandState(expandState)
const { setIsEmptyFromCount } = useIsEmptyState(isEmptyState)
</script>

<template>
  <VueThemer>
    <DashboardCard
      :mobile="mobile"
      v-model:expand-state="expandState"
      :is-empty-state="isEmptyState"
    >
      <template #card-controls>
        <slot name="card-controls"></slot>
      </template>

      <template #header>
        <div class="flex items-center">
          <div>Активные заказы</div>
          <OpenWhereSaleInMenu
            v-if="selectedSaleIds?.length > 0"
            :where-sale="whereSale"
          />
        </div>
      </template>

      <template #detailed>
        <div>
          Дедлайн:
          <span style="font-weight: bold">
            {{ getDaysFromNowLabel(daysFromNow) }}</span
          >
        </div>
      </template>
      <template #filter>
        <SalesPendingFilterButtons
          :sale-statuses="saleStatuses"
          :sale-item-statuses="saleItemStatuses"
          :days-from-now="daysFromNow"
          @update:sale-statuses="
            (val) => expandAndEmit(() => emit('update:sale-statuses', val))
          "
          @update:sale-item-statuses="
            (val) => expandAndEmit(() => emit('update:sale-item-statuses', val))
          "
          @update:days-from-now="
            (val) => expandAndEmit(() => emit('update:days-from-now', val))
          "
          @total-count="setIsEmptyFromCount"
      /></template>

      <template #table
        ><SalesPendingTable
          @update:sale-ids="(val) => setSelectedSaleIds(val)"
          @update:whereSale="(val) => setWhereSale(val)"
          :sale-statuses="saleStatuses"
          :sale-item-statuses="saleItemStatuses"
          :days-from-now="daysFromNow"
        />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import SalesDebtTable from 'src/pages/components/DashBoard/SalesDebt/SalesDebtTable.vue'
import SalesDebtFilterButtons from 'src/pages/components/DashBoard/SalesDebt/SalesDebtFilterButtons.vue'

import OpenWhereSaleInMenu from 'src/pages/components/OpenWhereSaleInMenu/OpenWhereSaleInMenu.vue'

import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '

import type { ExpandState } from 'src/pages/components/DashBoard/types'
import type { Sale_Bool_Exp } from 'src/gql/graphql'

const props = defineProps<{
  mobile?: boolean
  saleStatuses?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:sale-statuses', statuses: string[]): void
}>()

const whereSale = ref<Sale_Bool_Exp>(null)

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
})

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

function setWhereSale(val: Sale_Bool_Exp) {
  whereSale.value = val
}

const { expandAndEmit } = useExpandState(expandState)
const { setIsEmptyFromCount } = useIsEmptyState(isEmptyState)
</script>

<template>
  <VueThemer>
    <DashboardCard
      :mobile="props.mobile"
      :is-empty-state="isEmptyState"
      v-model:expand-state="expandState"
    >
      <template #card-controls>
        <slot name="card-controls"></slot>
      </template>

      <template #header>
        <div class="flex items-center">
          <div>
            Долги
            <q-tooltip theme="extra.delayWidth">
              Заказы, в которых есть неразвезенные долги
            </q-tooltip>
          </div>
          <OpenWhereSaleInMenu :where-sale="whereSale" />
        </div>
      </template>

      <template #filter>
        <SalesDebtFilterButtons
          :sale-statuses="props.saleStatuses"
          @update:sale-statuses="
            (val) => expandAndEmit(() => emit('update:sale-statuses', val))
          "
          @total-count="setIsEmptyFromCount"
        />
      </template>

      <template #table>
        <SalesDebtTable
          :sale-statuses="props.saleStatuses"
          @update:whereSale="(val) => setWhereSale(val)"
        />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

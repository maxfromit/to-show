<script setup lang="ts">
import l from 'lodash'
import { ref } from 'vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import SalesNotConfirmedTable from 'src/pages/components/DashBoard/SalesNotConfirmed/SalesNotConfirmedTable.vue'
import SalesNotConfirmedFilterButtons from 'src/pages/components/DashBoard/SalesNotConfirmed/SalesNotConfirmedFilterButtons.vue'

import OpenWhereSaleInMenu from 'src/pages/components/OpenWhereSaleInMenu/OpenWhereSaleInMenu.vue'

import { labelByEntity } from 'src/constants/labels'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
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

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
})

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

const whereSale = ref<Sale_Bool_Exp>({})

function setWhereSale(val: Sale_Bool_Exp) {
  whereSale.value = val
}

const { expandAndEmit } = useExpandState(expandState)
const { setIsEmptyFromCount } = useIsEmptyState(isEmptyState)

const { getProductMoveName } = useProductMoveNames()
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
            Не подтверждено в заказах
            <q-tooltip theme="extra.delayWidth">
              Заказы с позициями, в которых наступил или прошел
              {{ l.lowerCase(l.get(labelByEntity, 'sale_item.deadline')) }}, и у
              которых есть неподтвержденные
              {{ l.lowerCase(getProductMoveName('sale_item_id')) }}
            </q-tooltip>
          </div>
          <OpenWhereSaleInMenu :where-sale="whereSale" />
        </div>
      </template>
      <template #filter>
        <SalesNotConfirmedFilterButtons
          :sale-statuses="props.saleStatuses"
          @update:sale-statuses="
            (val) => expandAndEmit(() => emit('update:sale-statuses', val))
          "
          @total-count="setIsEmptyFromCount"
        />
      </template>

      <template #table>
        <SalesNotConfirmedTable
          :sale-statuses="props.saleStatuses"
          @update:whereSale="(val) => setWhereSale(val)"
        />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

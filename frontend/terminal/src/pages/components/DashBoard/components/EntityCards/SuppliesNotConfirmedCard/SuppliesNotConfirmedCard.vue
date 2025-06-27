<script setup lang="ts">
import { ref } from 'vue'

import SuppliesNotConfirmedTable from 'src/pages/components/DashBoard/SuppliesNotConfirmed/SuppliesNotConfirmedTable.vue'
import SuppliesNotConfirmedFilterButtons from 'src/pages/components/DashBoard/SuppliesNotConfirmed/SuppliesNotConfirmedFilterButtons.vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '
import type { ExpandState } from 'src/pages/components/DashBoard/types'

const props = defineProps<{
  mobile?: boolean
}>()

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
})

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

const { toggleExpand } = useExpandState(expandState)
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
        Не подтверждено в поставках
        <q-tooltip theme="extra.delayWidth">
          Поставки с позициями, в которых наступила или прошла
          {{
            l.lowerCase(
              l.get(labelByEntity, 'supply_item.deliveries.planned_at'),
            )
          }}, и у которых есть неподтвержденные
          {{ l.lowerCase(getProductMoveName('supply_item_id', 'deliveries')) }}
        </q-tooltip>
      </template>
      <template #filter>
        <SuppliesNotConfirmedFilterButtons
          @total-count="setIsEmptyFromCount"
          @button-click="toggleExpand"
        />
      </template>

      <template #table>
        <SuppliesNotConfirmedTable />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

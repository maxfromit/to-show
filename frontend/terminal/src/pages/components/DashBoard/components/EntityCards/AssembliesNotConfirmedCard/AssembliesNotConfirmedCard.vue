<script setup lang="ts">
import { ref } from 'vue'

import AssembliesNotConfirmedTable from 'src/pages/components/DashBoard/AssembliesNotConfirmed/AssembliesNotConfirmedTable.vue'
import AssembliesNotConfirmedFilterButtons from 'src/pages/components/DashBoard/AssembliesNotConfirmed/AssembliesNotConfirmedFilterButtons.vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import type { ExpandState } from 'src/pages/components/DashBoard/types'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '

const props = defineProps<{
  mobile?: boolean
}>()

const isEmptyState = defineModel<boolean>('isEmptyState', {
  default: true,
})

const expandState = defineModel<ExpandState>('expandState', {
  default: 'collapsed',
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
        Не подтверждено в комплектациях
        <q-tooltip theme="extra.delayWidth">
          Комплектации с позициями, в которых наступила или прошла
          {{
            l.lowerCase(l.get(labelByEntity, 'assembly_item.planned_in_at'))
          }}, и у которых есть неподтвержденные
          {{ l.lowerCase(getProductMoveName('assembly_item')) }}
        </q-tooltip>
      </template>
      <template #filter>
        <AssembliesNotConfirmedFilterButtons
          @total-count="setIsEmptyFromCount"
          @button-click="toggleExpand"
        />
      </template>

      <template #table>
        <AssembliesNotConfirmedTable />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

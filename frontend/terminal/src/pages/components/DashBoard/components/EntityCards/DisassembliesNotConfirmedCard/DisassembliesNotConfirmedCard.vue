<script setup lang="ts">
import { ref } from 'vue'
import DisassembliesNotConfirmedTable from 'src/pages/components/DashBoard/DisassembliesNotConfirmed/DisassembliesNotConfirmedTable.vue'
import DisassembliesNotConfirmedFilterButtons from 'src/pages/components/DashBoard/DisassembliesNotConfirmed/DisassembliesNotConfirmedFilterButtons.vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
import { useExpandState } from 'src/pages/components/DashBoard/utils/useExpandState'
import { useIsEmptyState } from 'src/pages/components/DashBoard/utils/useIsEmptyState '
import type { ExpandState } from 'src/pages/components/DashBoard/types'

const { getProductMoveName } = useProductMoveNames()

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
        Не подтверждено в разукомплектациях
        <q-tooltip theme="extra.delayWidth">
          Разукомплектации с позициями, в которых наступила или прошла
          {{
            l.lowerCase(l.get(labelByEntity, 'disassembly_item.planned_in_at'))
          }}, и у которых есть неподтвержденные
          {{ l.lowerCase(getProductMoveName('disassembly_item_id')) }}
        </q-tooltip>
      </template>
      <template #filter>
        <DisassembliesNotConfirmedFilterButtons
          @total-count="setIsEmptyFromCount"
          @button-click="toggleExpand"
        />
      </template>

      <template #table>
        <DisassembliesNotConfirmedTable />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, ref } from 'vue'
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'
import { columns } from './components/columns'
import { fragmentDisassemblyItem } from './components/fragment'
import ListEntityItemsMainData from 'src/pages/components/DashBoard/components/ListEntityItemsMainData/ListEntityItemsMainData.vue'
import { fragmentDisassemblyBasic } from 'src/constants/fragments'

import { getFormattedValueByColumnName } from 'src/utils/qTableColumnsHandlers/getFormattedValueByColumnName'
import { sortedDisassemblyItemsByPlannedAt } from 'src/pages/components/DashBoard/DisassembliesNotConfirmed/components/sortedDisassemblyItemsByPlannedAt'
import {
  whereNotConfirmedDisassembly,
  whereNotConfirmedDisassemblyItems,
} from 'src/pages/components/DashBoard/DisassembliesNotConfirmed/components/where'
import { getJustifyByColumnAligning } from 'src/utils/qTableColumnsHandlers/getJustifyByColumnAligning'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
import { rowsPerPage } from 'src/pages/components/DashBoard/components/rowsPerPage'
import { rowsPerPageOptions } from 'src/boot/themer'
import { getToName } from 'src/composables/useLinksCategoriesAndGetItByRouter'
import ListEntityMainData from 'src/pages/components/ListEntityMainData/ListEntityMainData.vue'
import DivBottomTableWithPaginationControl from 'src/pages/components/DashBoard/components/DivBottomTableWithPaginationControl.vue'

const props = defineProps<{
  mobile?: boolean
}>()

const { getProductMoveName } = useProductMoveNames()

const pagination = ref({
  // page: 1,
  rowsPerPage: rowsPerPage,
  sortBy: 'planned_at',
  descending: false,
  // rowsNumber: 0, // Initialize with 0 or the total number of rows if known
})

const {
  result: disassemblyWithNotConfirmedDisassemblyItemsResult,
  loading: disassemblyWithNotConfirmedDisassemblyItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query DisassembliesNotConfirmed_DisassemblyAndDisassemblyItems(
      # $limit: Int
      # $offset: Int
      $where_disassembly_items: disassembly_item_bool_exp!
      $where_disassembly: disassembly_bool_exp!
    ) {
      disassembly(
        # limit: $limit
        # offset: $offset
        where: $where_disassembly
      ) {
        ...MainFragments_DisassemblyFragment
        disassembly_items(where: $where_disassembly_items) {
          ...DisassembliesNotConfirmed_DisassemblyItem
        }
      }
    }
    ${fragmentDisassemblyBasic}
    ${fragmentDisassemblyItem}
  `,
  () => ({
    where_disassembly_items: whereNotConfirmedDisassemblyItems,
    where_disassembly: whereNotConfirmedDisassembly,
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const disassemblyWithNotConfirmedDisassemblyItems = computed(
  () =>
    disassemblyWithNotConfirmedDisassemblyItemsResult.value?.disassembly ?? [],
)

const rowsNumber = computed(
  () =>
    l.size(
      disassemblyWithNotConfirmedDisassemblyItemsResult.value?.disassembly,
    ) ?? 0,
)
</script>

<template>
  <VueThemer>
    <q-table
      v-if="!!rowsNumber"
      :rows="disassemblyWithNotConfirmedDisassemblyItems"
      :loading="disassemblyWithNotConfirmedDisassemblyItemsLoading"
      :columns="columns"
      v-model:pagination="pagination"
      binary-state-sort
      :rows-per-page-options="rowsPerPageOptions"
      :hide-bottom="rowsNumber && rowsNumber <= rowsPerPage ? true : false"
      row-key="id"
      class="absolute-full sticky-column-table"
      :card-container-class="props?.mobile ? 'column q-gutter-sm' : ''"
      :class="props?.mobile ? 'col mobile-table-top-padding' : ''"
      wrap-cells
      key="data-showing"
    >
      <template #body-cell-note="props">
        <q-td
          auto-width
          :props="props"
        >
          <div
            :class="getJustifyByColumnAligning(props.col.align)"
            class="row items-center q-gutter-x-xs no-wrap"
          >
            <div>
              {{
                getFormattedValueByColumnName({
                  columns,
                  columnName: props.col.name,
                  row: props.row,
                })
              }}
            </div>

            <q-btn
              theme="table.action"
              size="xs"
              icon="svguse:/icons.svg#info-circle"
            >
              <q-menu
                class="text-caption selected-element"
                max-width="15rem"
              >
                <ListEntityMainData
                  :entity-data="props.row"
                  :entity-name="'disassembly'"
                  :disassembly-type="'deliveries'"
                />
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #body-cell-planned_at="props">
        <q-td :props="props">
          <div
            :class="getJustifyByColumnAligning(props.col.align)"
            class="row items-center q-gutter-x-xs no-wrap"
          >
            <div>
              {{
                getFormattedValueByColumnName({
                  columns,
                  columnName: props.col.name,
                  row: props.row,
                })
              }}
            </div>

            <q-btn
              theme="table.action"
              size="xs"
              icon="svguse:/icons.svg#info-circle"
            >
              <q-menu
                class="text-caption selected-element"
                max-width="18rem"
                max-height="25rem"
              >
                <ListEntityItemsMainData
                  entity="disassembly"
                  :entityId="props.row.id"
                  :disassembly-type="'deliveries'"
                  :items="
                    sortedDisassemblyItemsByPlannedAt(
                      props?.row?.disassembly_items,
                    )
                  "
                  header="Не подтверждено в разукомплектации"
                  :caption="`Все позиции, где ${l.lowerCase(
                    getProductMoveName('disassembly_item_id'),
                  )}
                        не подтверждены, в которых наступила или прошла
                         ${l.lowerCase(
                           l.get(labelByEntity, 'disassembly_item.planned_at'),
                         )}`"
                />
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #body-cell-link="{ row }">
        <q-td auto-width>
          <q-btn
            theme="table.action"
            :to="{
              name: getToName({
                explicitPathStart: '/disassemblies',
              }),
              params: {
                disassemblyId: row.id,
                disassemblyMode: 'view',
              },
            }"
            :icon="'svguse:/icons.svg#arrow-right'"
          >
            <q-tooltip
              :delay="500"
              class="text-caption"
            >
              Перейти к заказу
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #bottom="scope">
        <DivBottomTableWithPaginationControl
          v-model:pagination="pagination"
          :rowsNumber="rowsNumber"
          :scope="scope"
        />
      </template>
    </q-table>

    <div
      v-if="!rowsNumber && !!disassemblyWithNotConfirmedDisassemblyItemsLoading"
      class="q-pa-md row col-grow justify-center"
      key="data-loading"
    >
      <div>
        <q-spinner
          color="primary"
          size="4em"
          :thickness="2"
        />
      </div>
    </div>

    <div
      v-else
      class="text-h6 text-center q-pa-md"
      key="data-empty"
    >
      Неподтвержденных разукомплектаций нет
    </div>
  </VueThemer>
</template>

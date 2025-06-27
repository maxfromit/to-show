<script setup lang="ts">
import { HQTable } from '@catchyname/hasura-quasar'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { __schema as schema } from 'src/gql/schema.json'
import { computed, ref, watchEffect } from 'vue'
import l from 'lodash'
import { columns } from './components/columns'
import { allActiveStatusesChoosen } from 'src/utils/handleSaleStatus'
import ListEntityMainData from 'src/pages/components/ListEntityMainData/ListEntityMainData.vue'
import ItemSectionInMenu from 'src/pages/components/DashBoard/components/ItemSectionInMenu.vue'
import {
  fragmentSaleWithSaleDebt,
  fragmentSaleDebtSummary,
  fragmentSaleAggregate,
} from './components/fragment'
import { fragmentSaleBasic } from 'src/constants/fragments'

import { useWhere } from './components/where'
import { getJustifyByColumnAligning } from 'src/utils/qTableColumnsHandlers/getJustifyByColumnAligning'
import { getFormattedValueByColumnName } from 'src/utils/qTableColumnsHandlers/getFormattedValueByColumnName'
import { rowsPerPage } from 'src/pages/components/DashBoard/components/rowsPerPage'
import ListEntityItemsMainData from 'src/pages/components/DashBoard/components/ListEntityItemsMainData/ListEntityItemsMainData.vue'
import DivBottomTableWithPaginationControl from 'src/pages/components/DashBoard/components/DivBottomTableWithPaginationControl.vue'

const props = defineProps<{
  saleStatuses?: string[]
  mobile?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:whereSale', value: typeof where.value | null): void
}>()

const pagination = ref({
  page: 1,
  rowsPerPage: rowsPerPage,
  sortBy: 'sale_debt_summary:bundle_items_count',
  descending: true,
  rowsNumber: 0, // Initialize with 0 or the total number of rows if known
})

const where = computed(() => {
  return {
    ...(!l.isEmpty(props.saleStatuses)
      ? { status: { _in: props.saleStatuses } }
      : {}),
    sale_debt_summary: { bundles_count: { _gt: '0' } },
  }
})

watchEffect(() => {
  emit('update:whereSale', where.value)
})

const { result: saleResult, loading: saleLoading } = useQuery(
  gql/* GraphQL */ `
    query SalesDebtTable_SaleAndDebt(
      $limit: Int
      $offset: Int
      $where: sale_bool_exp
    ) {
      sale(limit: $limit, offset: $offset, where: $where) {
        ...MainFragments_SaleFragment
        ...SalesDebtTable_SaleDebtSummaryFragment
      }
      sale_aggregate(where: $where) {
        ...SalesDebtTable_SaleAggregateFragment
      }
    }
    ${fragmentSaleBasic}
    ${fragmentSaleDebtSummary}
    ${fragmentSaleAggregate}
  `,
  () => ({
    limit:
      pagination.value.rowsPerPage === 0
        ? undefined
        : pagination.value.rowsPerPage,
    offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,

    where: useWhere(props.saleStatuses),
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const rowsNumber = computed(
  () => saleResult.value?.sale_aggregate?.aggregate?.count ?? 0,
)

watchEffect(() => {
  if (saleResult.value) {
    pagination.value.rowsNumber =
      saleResult.value?.sale_aggregate?.aggregate?.count ?? 0
  }
})
</script>

<template>
  <VueThemer>
    <HQTable
      v-if="!!rowsNumber"
      :schema="schema"
      typename="sale"
      :columns="columns"
      v-model:pagination="pagination"
      :fragment="fragmentSaleWithSaleDebt"
      :where="where"
      :grid="mobile"
      :hide-bottom="rowsNumber && rowsNumber <= rowsPerPage ? true : false"
      :card-container-class="props?.mobile ? 'column q-gutter-sm' : ''"
      :class="props?.mobile ? 'col' : ''"
      wrap-cells
      class="absolute-full sticky-column-table"
      key="data-showing"
    >
      <!-- <template #item="{ row }">
        <q-card
          flat
          bordered
        >
          <q-card-section horizontal>
            <q-card-section class="col">
              <div class="row items-center q-gutter-x-xs no-wrap">
                <div class="text-h6">{{ row?.customer?.name }}</div>
                <q-btn
                  theme="table.action"
                  size="xs"
                  icon="svguse:/icons.svg#info-circle"
                >
                  <q-menu
                    class="text-caption selected-element"
                    max-width="15rem"
                  >
                    <ListEntityMainData :sale="row" />
                  </q-menu>
                </q-btn>
              </div>
              <div class="text-subtitle2">
                Комплектов: {{ l.get(row, 'sale_debt_summary.bundles_count') }}
              </div>

              <div class="text-subtitle2">
                Долгов: {{ l.get(row, 'sale_debt_summary.bundle_items_count') }}
              </div>

              <div class="text-subtitle2">
                Долгов, шт.:
                {{
                  l.get(row, 'sale_debt_summary.total_bundle_items_quantity')
                }}
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </template> -->

      <template #body-cell-customer:name="props">
        <q-td
          auto-width
          :props="props"
        >
          <div class="row items-center q-gutter-x-xs no-wrap">
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
                  :entity-name="'sale'"
                />
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #body-cell-sale_debt_summary:bundles_count="props">
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
                max-width="20rem"
                max-height="25rem"
              >
                <q-list>
                  <ItemSectionInMenu
                    label="В долгах: записей (шт.)"
                    :value="`${l.get(props.row, 'sale_debt_summary.bundle_items_count')} (${l.get(
                      props.row,
                      'sale_debt_summary.total_bundle_items_quantity',
                    )})`"
                  />

                  <ListEntityItemsMainData
                    v-for="bundle in props.row?.bundlesWithDebts"
                    :entity="'sale'"
                    :entity-id="props.row.id"
                    :key="bundle.id"
                    :header="`Комплект c ${l.size(bundle.debts) > 1 ? 'долгами' : 'долгом'}`"
                    :caption="`${bundle.product.sku} – ${bundle.product.name}`"
                    :items="bundle.debts"
                  />
                </q-list>
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
              name: '/sales/[[saleId]].[[saleMode]].[[saleItemId]]',
              params: { saleId: row.id, saleMode: 'view' },
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
    </HQTable>
    <div
      v-if="!rowsNumber && !!saleLoading"
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
      {{
        !l.isEmpty(saleStatuses) && !allActiveStatusesChoosen(saleStatuses)
          ? 'Долгов в заказах с выбранным статусом нет'
          : 'Долгов нет'
      }}
    </div>
  </VueThemer>
</template>

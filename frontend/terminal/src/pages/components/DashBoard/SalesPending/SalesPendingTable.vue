<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, ref, watch, watchEffect } from 'vue'
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'
import { columns } from './components/columns'
import { allActiveStatusesChoosen } from 'src/utils/handleSaleStatus'
import ListEntityMainData from 'src/pages/components/ListEntityMainData/ListEntityMainData.vue'
import { fragmentSaleItem } from './components/fragment'
import { fragmentSaleBasic } from 'src/constants/fragments'
import ListEntityItemsMainData from 'src/pages/components/DashBoard/components/ListEntityItemsMainData/ListEntityItemsMainData.vue'
import { getFormattedValueByColumnName } from 'src/utils/qTableColumnsHandlers/getFormattedValueByColumnName'
import { sortedSaleItemsByDeadline } from './components/sortSaleItemsByDeadline'
import { getJustifyByColumnAligning } from 'src/utils/qTableColumnsHandlers/getJustifyByColumnAligning'
import { rowsPerPage } from 'src/pages/components/DashBoard/components/rowsPerPage'
import { rowsPerPageOptions } from 'src/boot/themer'
import {
  useWherePendingSale,
  useWherePendingSaleItemsWithDeadline,
} from './components/where'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
import { getToName } from 'src/composables/useLinksCategoriesAndGetItByRouter'
import { pluralDays } from 'src/pages/sales/utils/plural'
import DivBottomTableWithPaginationControl from 'src/pages/components/DashBoard/components/DivBottomTableWithPaginationControl.vue'

const props = defineProps<{
  saleStatuses?: string[]
  saleItemStatuses?: string[]
  daysFromNow?: number
  mobile?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:saleIds', value: number[] | null): void
  (e: 'update:whereSale', value: typeof whereSale.value | null): void
}>()

const { getProductMoveName } = useProductMoveNames()

const pagination = ref({
  rowsPerPage: rowsPerPage,
  sortBy: 'deadline',
  descending: false,
})

const whereSale = computed(() =>
  useWherePendingSale({
    saleStatuses: props.saleStatuses,
    daysFromNow: props.daysFromNow,
    saleItemStatuses: props.saleItemStatuses,
  }),
)

watchEffect(() => {
  emit('update:whereSale', whereSale.value)
})

const {
  result: salesPendingByDeadlineSaleItemsResult,
  loading: salesPendingByDeadlineSaleItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SalesPending_SaleAndSaleItems(
      $where_sale_items: sale_item_bool_exp!
      $where_sale: sale_bool_exp!
    ) {
      sale(where: $where_sale) {
        ...MainFragments_SaleFragment
        sale_items(where: $where_sale_items) {
          ...SalesPending_SaleItem
        }
      }
    }
    ${fragmentSaleBasic}
    ${fragmentSaleItem}
  `,
  () => ({
    where_sale_items: useWherePendingSaleItemsWithDeadline({
      daysFromNow: props.daysFromNow,
    }),
    where_sale: whereSale.value,
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const salesPendingByDeadlineSaleItems = computed(
  () => salesPendingByDeadlineSaleItemsResult.value?.sale ?? [],
)

watchEffect(() => {
  emit(
    'update:saleIds',
    salesPendingByDeadlineSaleItems.value.map((sale) => sale.id),
  )
})

const rowsNumber = computed(
  () => l.size(salesPendingByDeadlineSaleItemsResult.value?.sale) ?? 0,
)
</script>

<template>
  <VueThemer>
    <div class="absolute-full sticky-column-table">
      <q-table
        v-if="!!rowsNumber"
        :rows="salesPendingByDeadlineSaleItems"
        :loading="salesPendingByDeadlineSaleItemsLoading"
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
        <template #body-cell-customer="props">
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
                    :entity-name="'sale'"
                  />
                </q-menu>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #body-cell-deadline="props">
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
                    entity="sale"
                    :entityId="props.row.id"
                    :items="sortedSaleItemsByDeadline(props?.row?.sale_items)"
                    header="Ожидается в заказе"
                    :caption="`Все позиции, где ${l.lowerCase(
                      getProductMoveName('sale_item_id'),
                    )}
                    в недостаточном кол-ве или отстутствуют${
                      l.isNumber(daysFromNow)
                        ? `, в которых  ${l.lowerCase(labelByEntity?.sale_item?.deadline)} ${
                            daysFromNow > 0
                              ? `наступит в следующие  ${Math.abs(daysFromNow)} ${pluralDays(l.toNumber(daysFromNow))} или раньше`
                              : daysFromNow < 0
                                ? `наступил ${Math.abs(daysFromNow)} ${pluralDays(l.toNumber(daysFromNow))} назад или раньше`
                                : 'сегодня'
                          }`
                        : ''
                    }`"
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
                  explicitPathStart: '/sales',
                }),
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
      </q-table>

      <div
        v-if="!rowsNumber && !!salesPendingByDeadlineSaleItemsLoading"
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
          (!l.isEmpty(saleStatuses) &&
            !allActiveStatusesChoosen(saleStatuses)) ||
          !l.isEmpty(props.saleItemStatuses)
            ? 'Активных заказов с выбранным фильтром нет'
            : 'Активных заказов нет'
        }}
      </div>
    </div>
  </VueThemer>
</template>

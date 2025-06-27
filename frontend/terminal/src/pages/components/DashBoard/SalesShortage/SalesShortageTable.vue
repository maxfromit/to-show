<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, ref } from 'vue'
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'
import { columns } from './components/columns'
import { allActiveStatusesChoosen } from 'src/utils/handleSaleStatus'
import ListEntityMainData from 'src/pages/components/ListEntityMainData/ListEntityMainData.vue'
import {
  fragmentSaleItem,
  fragmentExpectedAvailability,
} from './components/fragment'
import { fragmentSaleBasic } from 'src/constants/fragments'
import ListEntityItemsMainData from 'src/pages/components/DashBoard/components/ListEntityItemsMainData/ListEntityItemsMainData.vue'
import { getFormattedValueByColumnName } from 'src/utils/qTableColumnsHandlers/getFormattedValueByColumnName'
import { sortedSaleItemsByDeadline } from './components/sortSaleItemsByDeadline'
import { getJustifyByColumnAligning } from 'src/utils/qTableColumnsHandlers/getJustifyByColumnAligning'
import { rowsPerPage } from 'src/pages/components/DashBoard/components/rowsPerPage'
import { rowsPerPageOptions } from 'src/boot/themer'
import {
  whereAvailabilitySaleItemsWithDeadline,
  whereAvailabilitySaleItems,
} from './components/where'
import { getToName } from 'src/composables/useLinksCategoriesAndGetItByRouter'
import { pluralDays } from 'src/pages/sales/utils/plural'
import DivBottomTableWithPaginationControl from 'src/pages/components/DashBoard/components/DivBottomTableWithPaginationControl.vue'

const props = defineProps<{
  saleStatuses?: string[]
  saleItemStatuses?: string[]
  daysFromNow?: number
  daysToShift?: number
  mobile?: boolean
}>()

const pagination = ref({
  rowsPerPage: rowsPerPage,
  sortBy: 'deadline',
  descending: false,
})

const whereAvailabilitySaleItemsWithDeadlineComputed = computed(() =>
  whereAvailabilitySaleItemsWithDeadline({
    saleStatuses: props.saleStatuses,
    daysFromNow: props.daysFromNow,
  }),
)

const whereAvailabilitySaleItemsComputed = computed(() =>
  whereAvailabilitySaleItems(props.saleItemStatuses),
)

const {
  result: salesShortageByDeadlineSaleItemsResult,
  loading: salesShortageByDeadlineSaleItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SalesShortage_SaleAndSaleItems(
      $daysToShift: Int
      $whereAvailabilitySaleItemsWithDeadline: sale_item_bool_exp!
      $whereAvailabilitySaleItems: sale_item_expected_availability_for_function_bool_exp
    ) {
      sale_item(where: $whereAvailabilitySaleItemsWithDeadline) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereAvailabilitySaleItems
        ) {
          ...ExpectedAvailabilityFragment
          sale_item {
            ...SalesShortage_SaleItem
            sale {
              ...MainFragments_SaleFragment
            }
          }
        }
      }
    }
    ${fragmentSaleBasic}
    ${fragmentSaleItem}
    ${fragmentExpectedAvailability}
  `,
  () => ({
    whereAvailabilitySaleItemsWithDeadline:
      whereAvailabilitySaleItemsWithDeadlineComputed.value,
    daysToShift: props.daysToShift ?? null,
    whereAvailabilitySaleItems: whereAvailabilitySaleItemsComputed.value,
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const salesShortageByDeadlineSaleItems = computed(() => {
  const groupedBySaleId = l.groupBy(
    l.filter(
      salesShortageByDeadlineSaleItemsResult.value?.sale_item,
      (row) => !l.isEmpty(row.expected_availability),
    ),
    (row) => l.get(row.expected_availability[0], 'sale_item.sale.id'),
  )

  return l.map(groupedBySaleId, (items) => {
    const sale = items[0].expected_availability[0].sale_item.sale
    const saleItems = items.map((item) => {
      const expectedAvailability = item.expected_availability[0]
      return {
        ...l.omit(expectedAvailability.sale_item, ['sale']),
        availability: {
          pending_count_by_date: expectedAvailability.pending_count_by_date,
          with_prognosis_value: expectedAvailability.with_prognosis_value,
          with_prognosis_value_with_ready_and_expected_to_assembly:
            expectedAvailability.with_prognosis_value_with_ready_and_expected_to_assembly,
          with_prognosis_value_with_ready_to_assembly:
            expectedAvailability.with_prognosis_value_with_ready_to_assembly,
          with_stock_by_date: expectedAvailability.with_stock_by_date,
          evaluation_at: expectedAvailability.evaluation_at,
        },
      }
    })

    return {
      ...sale,
      sale_items: saleItems,
    }
  })
})

const rowsNumber = computed(
  () => l.size(salesShortageByDeadlineSaleItems?.value) ?? 0,
)
</script>

<template>
  <VueThemer>
    <q-table
      v-if="!!rowsNumber"
      :rows="salesShortageByDeadlineSaleItems"
      :loading="salesShortageByDeadlineSaleItemsLoading"
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
                  header="Позиции с дефицитом"
                  :caption="`Все позиции, где не хватает наличия или планируемых поступлений, ${
                    l.isNumber(daysFromNow)
                      ? `в которых  ${l.lowerCase(labelByEntity?.sale_item?.deadline)} ${
                          daysFromNow > 0
                            ? `наступит в следующие  ${Math.abs(daysFromNow)} ${pluralDays(daysFromNow)} или раньше`
                            : daysFromNow < 0
                              ? `наступил ${Math.abs(daysFromNow)} ${pluralDays(daysFromNow)} назад или раньше`
                              : 'сегодня'
                        }`
                      : ''
                  } ${l.isNumber(daysFromNow) ? 'и' : ''} с оценкой дефицита  ${
                    !!daysToShift
                      ? `${
                          daysToShift > 0
                            ? `через ${Math.abs(daysToShift)} ${pluralDays(daysToShift)} после дедлайна`
                            : `за ${Math.abs(daysToShift)} ${pluralDays(l.toNumber(daysToShift))} до дедлайна`
                        }`
                      : 'в день дедлайна'
                  } `"
                  :selectedSaleItemShortageStatuses="saleItemStatuses"
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
      v-if="!rowsNumber && !!salesShortageByDeadlineSaleItemsLoading"
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
        (!l.isEmpty(props.saleStatuses) &&
          !allActiveStatusesChoosen(props.saleStatuses)) ||
        !l.isEmpty(props.saleItemStatuses)
          ? 'Дефицитных заказов с выбранным фильтром нет'
          : 'Дефицитных заказов нет'
      }}
    </div>
  </VueThemer>
</template>

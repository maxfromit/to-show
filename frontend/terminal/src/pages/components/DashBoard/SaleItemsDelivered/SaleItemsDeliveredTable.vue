<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, ref } from 'vue'
import l from 'lodash'
import { columns } from './components/columns'

import { fragmentProductBasic } from 'src/constants/fragments'

import { rowsPerPage } from 'src/pages/components/DashBoard/components/rowsPerPage'
import { rowsPerPageOptions } from 'src/boot/themer'
import {
  whereProductMovesSaleItemsDeliveredForDays,
  whereProductWithMoves,
} from './components/where'
import DivBottomTableWithPaginationControl from 'src/pages/components/DashBoard/components/DivBottomTableWithPaginationControl.vue'
import ElilipsedProductCell from 'src/pages/components/DashBoard/components/ElilipsedProductCell/ElilipsedProductCell.vue'

const props = defineProps<{
  saleStatuses?: string[]
  saleItemStatuses?: string[]
  productIds?: number[]
  daysFromNow?: number
  mobile?: boolean
}>()

const textFilter = defineModel<string | null>('textFilter', {
  default: null,
})

const pagination = ref({
  rowsPerPage: rowsPerPage,
  sortBy: 'count',
  descending: true,
})

const whereProduct = computed(() => {
  return whereProductWithMoves({
    productIds: props.productIds,
    text: textFilter.value,
    daysFromNow: props.daysFromNow,
  })
})

const whereProductMoves = computed(() => {
  return whereProductMovesSaleItemsDeliveredForDays(props.daysFromNow)
})

const {
  result: saleItemsDeliveredForDaysResult,
  loading: saleItemsDeliveredForDaysLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SaleItemsDelivered_ProductMoveAggregate(
      $whereProduct: product_bool_exp!
      $whereProductMoves: product_move_bool_exp
    ) {
      product(where: $whereProduct) {
        ...MainFragments_ProductFragment
        product_moves_aggregate(where: $whereProductMoves) {
          aggregate {
            sum {
              count
            }
          }
        }
      }
    }
    ${fragmentProductBasic}
  `,
  () => ({
    whereProduct: whereProduct.value,
    whereProductMoves: whereProductMoves.value,
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const saleItemsDeliveredForDays = computed(() => {
  return saleItemsDeliveredForDaysResult?.value?.product
    ? l.map(saleItemsDeliveredForDaysResult?.value?.product, (product) => {
        return {
          id: product?.id,
          sku: product?.sku,
          name: product?.name,
          bundle_id: product?.bundle_id,
          price: product?.price,
          count: Math.abs(
            product?.product_moves_aggregate?.aggregate?.sum?.count,
          ),
        }
      })
    : []
})

const rowsNumber = computed(() => l.size(saleItemsDeliveredForDays?.value) ?? 0)
</script>

<template>
  <VueThemer>
    <q-table
      :rows="saleItemsDeliveredForDays"
      :loading="saleItemsDeliveredForDaysLoading"
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
      <template #top-row>
        <q-tr>
          <q-td :colspan="l.size(columns)">
            <q-input
              :outlined="false"
              placeholder="по названию и артикулу"
              outline
              clearable
              v-model="textFilter"
              :bg-color="
                !!textFilter?.trim() ? 'field-active-green' : undefined
              "
            >
              <template #prepend>
                <q-icon
                  name="search"
                  color="primary"
                  size="xs"
                >
                  <q-tooltip
                    :delay="500"
                    max-width="15rem"
                    class="text-caption selected-element text-center"
                  >
                    Поиск по названию и артикулу
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </q-td>
        </q-tr>
      </template>

      <template #body-cell-product="props">
        <q-td :props="props">
          <ElilipsedProductCell
            :cellProps="props"
            :columns="columns"
          />
        </q-td>
      </template>

      <template #bottom="scope">
        <DivBottomTableWithPaginationControl
          v-model:pagination="pagination"
          :rowsNumber="rowsNumber"
          :scope="scope"
        />
      </template>

      <template #no-data>
        {{
          !l.isEmpty(textFilter)
            ? `Реализованных позиций с "${textFilter}" в названии или артикуле нет ${daysFromNow ? 'в выбранный период' : ''}`
            : !l.isEmpty(props.productIds)
              ? `Выбранные позиции не были реализованы ${daysFromNow ? 'в выбранный период' : ''}`
              : 'Реализованных позиций нет'
        }}
      </template>
    </q-table>
  </VueThemer>
</template>

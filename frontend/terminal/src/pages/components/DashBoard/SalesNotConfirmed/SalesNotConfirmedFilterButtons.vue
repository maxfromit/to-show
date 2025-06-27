<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, watchEffect } from 'vue'
import l from 'lodash'

import { fragmentSaleBasic } from 'src/constants/fragments'
import { getTextColorClassByNumberZeroGood } from 'src/utils/getTextColorClassByNumber'
import { activeSaleStatuses } from 'src/utils/handleSaleStatus'
import { useWhere } from './components/where'

const emit = defineEmits<{
  (e: 'total-count', count: number): void
}>()

const selectedSaleStatuses = defineModel<string[]>('saleStatuses', {
  default: [],
})

const updateSearchSaleStatus = (inputStatus: string) => {
  if (l.includes(selectedSaleStatuses.value, inputStatus))
    return (selectedSaleStatuses.value = [
      ...l.pull([...selectedSaleStatuses.value], inputStatus),
    ])
  selectedSaleStatuses.value = [inputStatus, ...selectedSaleStatuses.value]
}

const {
  result: saleWithNotConfirmedSaleItemsResult,
  loading: saleWithNotConfirmedSaleItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SalesNotConfirmedFilterButtons_Sale(
      $whereRequests: sale_bool_exp!
      $whereDeals: sale_bool_exp!
      $whereExecuted: sale_bool_exp!
      $whereTotal: sale_bool_exp!
    ) {
      notConfirmedInRequests: sale(where: $whereRequests) {
        ...MainFragments_SaleFragment
      }
      notConfirmedInDeals: sale(where: $whereDeals) {
        ...MainFragments_SaleFragment
      }
      notConfirmedInExecuted: sale(where: $whereExecuted) {
        ...MainFragments_SaleFragment
      }
      total: sale(where: $whereTotal) {
        ...MainFragments_SaleFragment
      }
    }
    ${fragmentSaleBasic}
  `,
  () => ({
    whereRequests: useWhere(['request']),
    whereDeals: useWhere(['deal']),
    whereExecuted: useWhere(['executed']),
    whereTotal: useWhere(),
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const counts = computed(() => ({
  request:
    l.size(saleWithNotConfirmedSaleItemsResult.value?.notConfirmedInRequests) ??
    0,
  deal:
    l.size(saleWithNotConfirmedSaleItemsResult.value?.notConfirmedInDeals) ?? 0,
  executed:
    l.size(saleWithNotConfirmedSaleItemsResult.value?.notConfirmedInExecuted) ??
    0,
  total: l.size(saleWithNotConfirmedSaleItemsResult.value?.total) ?? 0,
}))

watchEffect(
  () =>
    !saleWithNotConfirmedSaleItemsLoading.value &&
    emit('total-count', counts?.value?.total),
)
</script>

<template>
  <VueThemer>
    <div
      v-if="!saleWithNotConfirmedSaleItemsLoading"
      class="row"
    >
      <q-btn-group
        spread
        unelevated
        :outline="false"
        class="col-grow justify-center q-gutter-x-xs"
        style="height: 5rem"
      >
        <q-btn
          v-for="(status, index) in activeSaleStatuses"
          :key="index"
          @click="updateSearchSaleStatus(status.value)"
          outline
          unelevated
          :color="
            l.includes(selectedSaleStatuses, status.value)
              ? 'primary'
              : undefined
          "
        >
          <div class="column full-height">
            <div class="text-caption">
              {{ status.label }}
              <q-separator />
            </div>
            <div class="col column col-grow justify-center">
              <div
                class="text-h2"
                :class="
                  getTextColorClassByNumberZeroGood(l.get(counts, status.value))
                "
              >
                {{ l.get(counts, status.value) }}
              </div>
            </div>
          </div>
        </q-btn>
      </q-btn-group>
    </div>

    <div
      class="q-pa-md row col-grow justify-center"
      v-if="!!saleWithNotConfirmedSaleItemsLoading"
    >
      <div>
        <q-spinner
          color="primary"
          size="4em"
          :thickness="2"
        />
      </div>
    </div>
  </VueThemer>
</template>

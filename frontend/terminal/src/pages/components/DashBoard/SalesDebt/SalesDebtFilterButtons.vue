<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, watchEffect } from 'vue'
import l from 'lodash'

import { fragmentSaleAggregate } from './components/fragment'
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

const { result: saleAggregateResult, loading: saleAggregateLoading } = useQuery(
  gql/* GraphQL */ `
    query FilterButtons_SaleAggregate(
      $whereRequests: sale_bool_exp!
      $whereDeals: sale_bool_exp!
      $whereExecuted: sale_bool_exp!
      $whereTotal: sale_bool_exp!
    ) {
      debtsInRequests: sale_aggregate(where: $whereRequests) {
        ...SalesDebtTable_SaleAggregateFragment
      }
      debtsInDeals: sale_aggregate(where: $whereDeals) {
        ...SalesDebtTable_SaleAggregateFragment
      }
      debtsInExecuted: sale_aggregate(where: $whereExecuted) {
        ...SalesDebtTable_SaleAggregateFragment
      }
      total: sale_aggregate(where: $whereTotal) {
        ...SalesDebtTable_SaleAggregateFragment
      }
    }
    ${fragmentSaleAggregate}
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
  request: saleAggregateResult.value?.debtsInRequests?.aggregate?.count ?? 0,
  deal: saleAggregateResult.value?.debtsInDeals?.aggregate?.count ?? 0,
  executed: saleAggregateResult.value?.debtsInExecuted?.aggregate?.count ?? 0,
  total: saleAggregateResult.value?.total?.aggregate?.count ?? 0,
}))

watchEffect(
  () =>
    !saleAggregateLoading.value && emit('total-count', counts?.value?.total),
)
</script>

<template>
  <VueThemer>
    <div
      v-if="!saleAggregateLoading"
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

        <!-- <q-btn
          outline
          rounded
          :color="l.includes(statuses, 'request') ? 'primary' : undefined"
          @click="updateSearchSaleStatus('request')"
        >
          <div class="column full-height">
            <div class="text-caption">
              {{ l.get(findSaleType('request'), 'label') }}
              <q-separator />
            </div>
            <div class="col column col-grow justify-center">
              <div
                class="text-h2"
                :class="getTextColorClassByNumber(requestsCount)"
              >
                {{ requestsCount }}
              </div>
            </div>
          </div>
        </q-btn>

        <q-btn
          outline
          rounded
          :color="l.includes(statuses, 'deal') ? 'primary' : undefined"
          @click="updateSearchSaleStatus('deal')"
        >
          <div class="column full-height">
            <div class="text-caption">
              {{ l.get(findSaleType('deal'), 'label') }}
              <q-separator />
            </div>
            <div class="col column col-grow justify-center">
              <div
                class="text-h2"
                :class="getTextColorClassByNumber(dealsCount)"
              >
                {{ dealsCount }}
              </div>
            </div>
          </div>
        </q-btn>

        <q-btn
          outline
          rounded
          :color="l.includes(statuses, 'executed') ? 'primary' : undefined"
          @click="updateSearchSaleStatus('executed')"
        >
          <div class="column full-height">
            <div class="text-caption">
              {{ l.get(findSaleType('executed'), 'label') }}
              <q-separator />
            </div>
            <div class="col column col-grow justify-center">
              <div
                class="text-h2"
                :class="getTextColorClassByNumber(executedCount)"
              >
                {{ executedCount }}
              </div>
            </div>
          </div>
        </q-btn> -->
      </q-btn-group>
    </div>

    <div
      class="q-pa-md row col-grow justify-center"
      v-if="!!saleAggregateLoading"
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

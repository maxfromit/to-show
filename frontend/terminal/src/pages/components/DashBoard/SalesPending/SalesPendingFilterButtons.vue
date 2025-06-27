<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, watch, ref, watchEffect } from 'vue'
import l from 'lodash'

import { fragmentSaleBasic } from 'src/constants/fragments'
import { getTextColorClassByNumberZeroGood } from 'src/utils/getTextColorClassByNumber'
import { activeSaleStatuses } from 'src/utils/handleSaleStatus'
import { useWherePendingSale } from './components/where'
import { pluralDays } from 'src/pages/sales/utils/plural'
import { statusDetails } from 'src/pages/sales/composables/useStatusDetails'
import { excludedStatuses } from 'src/pages/components/DashBoard/SalesPending/components/excludedSaleAndSaleItemStatuses'
import { dateFromNowInitial } from 'src/pages/components/DashBoard/SalesPending/components/initialDateFromNow'

const emit = defineEmits<{
  (e: 'total-count', count: number): void
}>()

const selectedSaleStatuses = defineModel<string[]>('saleStatuses', {
  default: [],
})

const selectedSaleItemStatuses = defineModel<string[]>('saleItemStatuses', {
  default: [],
})

const daysFromNow = defineModel<number | undefined>('daysFromNow', {
  default: undefined,
})

// const daysFromNowForHeader = defineModel<number | undefined>(
//   'daysFromNowForHeader',
//   {
//     default: 30,
//   },
// )

// watch(
//   () => daysFromNow.value,
//   () => {
//     daysFromNowForHeader.value = daysFromNow.value
//   },
//   { immediate: true },
// )
const tempDaysFromNow = ref(daysFromNow.value)

const updateSearchSaleStatus = (inputStatus: string) => {
  if (l.includes(selectedSaleStatuses.value, inputStatus))
    return (selectedSaleStatuses.value = [
      ...l.pull([...selectedSaleStatuses.value], inputStatus),
    ])
  selectedSaleStatuses.value = [inputStatus, ...selectedSaleStatuses.value]
}

const updateSearchSaleItemStatus = (inputStatus: string) => {
  if (l.includes(selectedSaleItemStatuses.value, inputStatus))
    return (selectedSaleItemStatuses.value = [
      ...l.pull([...selectedSaleItemStatuses.value], inputStatus),
    ])
  selectedSaleItemStatuses.value = [
    inputStatus,
    ...selectedSaleItemStatuses.value,
  ]
}

const {
  result: salesPendingByDeadlineSaleItemsResult,
  loading: salesPendingByDeadlineSaleItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SalesPendingFilterButtons_Sale(
      $whereRequests: sale_bool_exp!
      $whereDeals: sale_bool_exp!
      $whereExecuted: sale_bool_exp!
      $whereTotal: sale_bool_exp!
      $whereItemPartlyExecuted: sale_bool_exp!
      $whereItemInsufficient: sale_bool_exp!
      $whereItemNotAssigned: sale_bool_exp!
      $whereItemAllAssigned: sale_bool_exp!
      $whereItemExtra: sale_bool_exp!
    ) {
      pendingInRequest: sale(where: $whereRequests) {
        ...MainFragments_SaleFragment
      }
      pendingInDeals: sale(where: $whereDeals) {
        ...MainFragments_SaleFragment
      }
      pendingInExecuted: sale(where: $whereExecuted) {
        ...MainFragments_SaleFragment
      }
      total: sale(where: $whereTotal) {
        ...MainFragments_SaleFragment
      }
      pendingItemPartlyExecuted: sale(where: $whereItemPartlyExecuted) {
        ...MainFragments_SaleFragment
      }
      pendingItemInsufficient: sale(where: $whereItemInsufficient) {
        ...MainFragments_SaleFragment
      }
      pendingItemNotAssigned: sale(where: $whereItemNotAssigned) {
        ...MainFragments_SaleFragment
      }
      pendingItemAllAssigned: sale(where: $whereItemAllAssigned) {
        ...MainFragments_SaleFragment
      }
      pendingItemExtra: sale(where: $whereItemExtra) {
        ...MainFragments_SaleFragment
      }
    }
    ${fragmentSaleBasic}
  `,
  () => ({
    whereRequests: useWherePendingSale({
      saleStatuses: ['request'],
      daysFromNow: daysFromNow.value,
    }),
    whereDeals: useWherePendingSale({
      saleStatuses: ['deal'],
      daysFromNow: daysFromNow.value,
    }),
    whereExecuted: useWherePendingSale({
      saleStatuses: ['executed'],
      daysFromNow: daysFromNow.value,
    }),
    whereItemInsufficient: useWherePendingSale({
      saleStatuses: selectedSaleStatuses.value,
      daysFromNow: daysFromNow.value,
      saleItemStatuses: ['insufficient'],
    }),
    whereItemPartlyExecuted: useWherePendingSale({
      saleStatuses: selectedSaleStatuses.value,
      daysFromNow: daysFromNow.value,
      saleItemStatuses: ['partly-executed'],
    }),
    whereItemNotAssigned: useWherePendingSale({
      saleStatuses: selectedSaleStatuses.value,
      daysFromNow: daysFromNow.value,
      saleItemStatuses: ['not-assigned'],
    }),
    whereItemAllAssigned: useWherePendingSale({
      saleStatuses: selectedSaleStatuses.value,
      daysFromNow: daysFromNow.value,
      saleItemStatuses: ['all-assigned'],
    }),
    whereItemExtra: useWherePendingSale({
      saleStatuses: selectedSaleStatuses.value,
      daysFromNow: daysFromNow.value,
      saleItemStatuses: ['extra'],
    }),

    whereTotal: useWherePendingSale({ daysFromNow: daysFromNow.value }),
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const counts = computed(() => ({
  request:
    l.size(salesPendingByDeadlineSaleItemsResult.value?.pendingInRequest) ?? 0,
  deal:
    l.size(salesPendingByDeadlineSaleItemsResult.value?.pendingInDeals) ?? 0,
  executed:
    l.size(salesPendingByDeadlineSaleItemsResult.value?.pendingInExecuted) ?? 0,
  total: l.size(salesPendingByDeadlineSaleItemsResult.value?.total) ?? 0,
  ['not-assigned']:
    l.size(
      salesPendingByDeadlineSaleItemsResult.value?.pendingItemNotAssigned,
    ) ?? 0,

  insufficient:
    l.size(
      salesPendingByDeadlineSaleItemsResult.value?.pendingItemInsufficient,
    ) ?? 0,

  ['partly-executed']:
    l.size(
      salesPendingByDeadlineSaleItemsResult.value?.pendingItemPartlyExecuted,
    ) ?? 0,

  ['all-assigned']:
    l.size(
      salesPendingByDeadlineSaleItemsResult.value?.pendingItemAllAssigned,
    ) ?? 0,
  ['extra']:
    l.size(salesPendingByDeadlineSaleItemsResult.value?.pendingItemExtra) ?? 0,
}))

watchEffect(
  () =>
    !salesPendingByDeadlineSaleItemsLoading.value &&
    emit('total-count', counts?.value?.total),
)

const isDaysFromNowActive = ref(true)

watch(
  () => daysFromNow.value,
  () => {
    if (!l.isNumber(daysFromNow.value)) {
      isDaysFromNowActive.value = false
      tempDaysFromNow.value = dateFromNowInitial
    }
    if (l.isNumber(daysFromNow.value)) {
      isDaysFromNowActive.value = true
      tempDaysFromNow.value = daysFromNow.value
    }
  },
  { immediate: true },
)
</script>

<template>
  <VueThemer>
    <div class="row col items-center q-gutter-x-sm q-px-sm">
      <q-toggle
        v-model="isDaysFromNowActive"
        @update:model-value="
          (val) =>
            !val ? (daysFromNow = undefined) : (daysFromNow = tempDaysFromNow)
        "
        dense
      >
        <q-tooltip theme="extra.delayWidth">
          {{
            isDaysFromNowActive
              ? 'Выключить фильтр по дате дедлайна'
              : 'Включить фильтр по дате дедлайна'
          }}
        </q-tooltip>
      </q-toggle>

      <div class="col-grow column">
        <q-badge
          v-if="l.isNumber(daysFromNow)"
          :disable="!isDaysFromNowActive"
          :class="{ 'inactive-item': !isDaysFromNowActive }"
          class="self-start"
        >
          {{
            daysFromNow > 0
              ? `+${Math.abs(daysFromNow)} ${pluralDays(l.toNumber(daysFromNow))}`
              : daysFromNow < 0
                ? `-${Math.abs(daysFromNow)} ${pluralDays(l.toNumber(daysFromNow))}`
                : 'На сегодня'
          }}
        </q-badge>

        <q-slider
          v-model="tempDaysFromNow"
          @change="
            (val) => {
              daysFromNow = val
            }
          "
          :min="-100"
          :max="100"
          label
          :disable="!isDaysFromNowActive"
        />
      </div>
    </div>

    <div class="row">
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
            <div
              v-if="!salesPendingByDeadlineSaleItemsLoading"
              class="col column col-grow justify-center"
              key="sale-count"
            >
              <div
                class="text-h2"
                :class="
                  getTextColorClassByNumberZeroGood(l.get(counts, status.value))
                "
              >
                {{ l.get(counts, status.value) }}
              </div>
            </div>
            <div
              class="q-pa-md row col-grow justify-center"
              key="sales-loading"
              v-else
            >
              <div>
                <q-spinner
                  color="primary"
                  :thickness="2"
                />
              </div>
            </div>
          </div>
        </q-btn>
      </q-btn-group>
    </div>

    <div class="row">
      <q-btn-group
        spread
        unelevated
        :outline="false"
        class="col-grow justify-center q-gutter-x-xs"
        style="height: 4rem"
      >
        <q-btn
          v-for="(status, index) in l.omitBy(statusDetails, (status) =>
            l.includes(
              [...excludedStatuses, 'status-unknown'],
              status.statusResult,
            ),
          )"
          :key="index"
          @click="updateSearchSaleItemStatus(status.statusResult)"
          outline
          unelevated
          :color="
            l.includes(selectedSaleItemStatuses, status.statusResult)
              ? 'primary'
              : undefined
          "
        >
          <div class="column full-height">
            <div>
              <q-icon
                :name="status.iconName"
                :color="status.color"
                size="xs"
              />
              <q-tooltip class="text-caption text-center">
                {{ status.message }}
              </q-tooltip>
            </div>

            <div
              v-if="!salesPendingByDeadlineSaleItemsLoading"
              class="col column col-grow justify-center"
              key="sale-count"
            >
              <div
                class="text-h4 text-weight-thin"
                :class="
                  getTextColorClassByNumberZeroGood(
                    l.get(counts, status.statusResult),
                  )
                "
              >
                {{ l.get(counts, status.statusResult) }}
              </div>
            </div>
            <div
              class="row col-grow justify-center"
              key="sales-loading"
              v-else
            >
              <div>
                <q-spinner
                  color="primary"
                  :thickness="1"
                  size="1rem"
                />
              </div>
            </div>
          </div>
        </q-btn>
      </q-btn-group>
    </div>
  </VueThemer>
</template>

<style scoped lang="scss">
.inactive-item {
  opacity: 0.5;
}
</style>

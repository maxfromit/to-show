<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, watch, ref, watchEffect } from 'vue'
import l from 'lodash'

import { fragmentSaleBasic } from 'src/constants/fragments'
import {
  fragmentSaleItem,
  fragmentExpectedAvailability,
} from './components/fragment'
import { activeSaleStatuses } from 'src/utils/handleSaleStatus'

import {
  whereAvailabilitySaleItemsWithDeadline,
  whereAvailabilitySaleItems,
} from './components/where'
import { pluralDays } from 'src/pages/sales/utils/plural'
import { saleItemShortageStatusDetails } from 'src/pages/components/DashBoard/SalesShortage/components/saleItemShortageStatusDetails'
import { getTextColorClassByNumberZeroGood } from 'src/utils/getTextColorClassByNumber'

import {
  daysFromNowInitial,
  daysToShiftInitial,
} from './components/initialDaysShifting'

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

const daysToShift = defineModel<number | undefined>('daysToShift', {
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
const tempDaysToShift = ref(daysToShift.value)

const updateSearchSaleStatus = (inputStatus: string) => {
  if (l.includes(selectedSaleStatuses.value, inputStatus))
    return (selectedSaleStatuses.value = [
      ...l.pull([...selectedSaleStatuses.value], inputStatus),
    ])
  selectedSaleStatuses.value = [inputStatus, ...selectedSaleStatuses.value]
}

const prognosisSaleItemShortageStatuses = l.omitBy(
  saleItemShortageStatusDetails,
  (status) => status.statusResult === 'with_stock_by_date',
)

const prognosisStatusResults = l.map(
  prognosisSaleItemShortageStatuses,
  'statusResult',
)

const netStockSaleItemShortageStatus = l
  .chain(saleItemShortageStatusDetails)
  .filter((status) => status.statusResult === 'with_stock_by_date')
  .first()
  .value()

const isLastSelectedPrognosisStatus = (
  statusToCheck: string,
  selectedIndex: number,
) => {
  return (
    l.includes(selectedSaleItemStatuses.value, statusToCheck) &&
    selectedIndex ===
      l.size(
        l.intersection(selectedSaleItemStatuses.value, prognosisStatusResults),
      )
  )
}

const updateItemAvailabilityNetStockStatuses = (inputStatus: string) => {
  if (l.includes(selectedSaleItemStatuses.value, inputStatus))
    return (selectedSaleItemStatuses.value = [
      ...l.pull([...selectedSaleItemStatuses.value], inputStatus),
    ])
  selectedSaleItemStatuses.value = [
    inputStatus,
    ...selectedSaleItemStatuses.value,
  ]
}

const updateItemAvailabilityPrognosisStatuses = (inputStatus: string) => {
  const indexOfInputtedStatus = l.indexOf(prognosisStatusResults, inputStatus)

  if (indexOfInputtedStatus === -1) return

  const maxSelectedIndex = l
    .chain(selectedSaleItemStatuses.value)
    .map((status) => l.indexOf(prognosisStatusResults, status))
    .max()
    .value()

  const selectedNotPrognosisStatuses = l.difference(
    selectedSaleItemStatuses.value,
    prognosisStatusResults,
  )

  if (maxSelectedIndex === indexOfInputtedStatus) {
    selectedSaleItemStatuses.value = [...selectedNotPrognosisStatuses]
    return
  }
  const selectedSaleItemPrognosisStatuses = l.take(
    prognosisStatusResults,
    indexOfInputtedStatus + 1,
  )

  selectedSaleItemStatuses.value = [
    ...selectedNotPrognosisStatuses,
    ...selectedSaleItemPrognosisStatuses,
  ]
}

const {
  result: saleItemsAvailabilityByDeadlineResult,
  loading: saleItemsAvailabilityByDeadlineLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SalesShortageFilterButtons_SaleItemWithExpectedProblemWitExpectedAvailabilityAndSale(
      $daysToShift: Int
      $whereRequestItems: sale_item_bool_exp!
      $whereDealItems: sale_item_bool_exp!
      $whereExecutedItems: sale_item_bool_exp!
      $whereItemsWithSelectedSaleStatus: sale_item_bool_exp!
      $whereAnyProblem: sale_item_expected_availability_for_function_bool_exp
      $whereNotInStock: sale_item_expected_availability_for_function_bool_exp
      $whereNotEnoughInPrognosis: sale_item_expected_availability_for_function_bool_exp
      $whereNotEnoughInPrognosisWithReadyToAssembly: sale_item_expected_availability_for_function_bool_exp
      $whereNotEnoughInPrognosisWithReadyAndExpectedToAssembly: sale_item_expected_availability_for_function_bool_exp
    ) {
      availabilityInRequest: sale_item(where: $whereRequestItems) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereAnyProblem
        ) {
          sale_item {
            sale {
              id
            }
          }
        }
      }

      availabilityInDeals: sale_item(where: $whereDealItems) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereAnyProblem
        ) {
          sale_item {
            sale {
              id
            }
          }
        }
      }

      availabilityInExecuted: sale_item(where: $whereExecutedItems) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereAnyProblem
        ) {
          sale_item {
            sale {
              id
            }
          }
        }
      }

      # total: sale_item(where: $whereAllActiveItems) {
      #   expected_availability(
      #     args: { days_to_shift: $daysToShift }
      #     where: $whereAnyProblem
      #   ) {
      #     sale_item {
      #       sale {
      #         id
      #       }
      #     }
      #   }
      # }

      availabilityNotInStock: sale_item(
        where: $whereItemsWithSelectedSaleStatus
      ) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereNotInStock
        ) {
          sale_item {
            sale {
              id
            }
          }
        }
      }

      availabilityNotEnoughInPrognosis: sale_item(
        where: $whereItemsWithSelectedSaleStatus
      ) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereNotEnoughInPrognosis
        ) {
          sale_item {
            sale {
              id
            }
          }
        }
      }

      availabilityNotEnoughInPrognosisWithReadyToAssembly: sale_item(
        where: $whereItemsWithSelectedSaleStatus
      ) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereNotEnoughInPrognosisWithReadyToAssembly
        ) {
          sale_item {
            sale {
              id
            }
          }
        }
      }

      availabilityNotEnoughtInAllPrognosis: sale_item(
        where: $whereItemsWithSelectedSaleStatus
      ) {
        expected_availability(
          args: { days_to_shift: $daysToShift }
          where: $whereNotEnoughInPrognosisWithReadyAndExpectedToAssembly
        ) {
          sale_item {
            sale {
              id
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
    whereRequestItems: whereAvailabilitySaleItemsWithDeadline({
      saleStatuses: ['request'],
      daysFromNow: daysFromNow.value,
    }),
    whereDealItems: whereAvailabilitySaleItemsWithDeadline({
      saleStatuses: ['deal'],
      daysFromNow: daysFromNow.value,
    }),
    whereExecutedItems: whereAvailabilitySaleItemsWithDeadline({
      saleStatuses: ['executed'],
      daysFromNow: daysFromNow.value,
    }),
    whereItemsWithSelectedSaleStatus: whereAvailabilitySaleItemsWithDeadline({
      saleStatuses: selectedSaleStatuses.value,
      daysFromNow: daysFromNow.value,
    }),

    daysToShift: daysToShift.value ?? null,
    whereAnyProblem: whereAvailabilitySaleItems([]),
    whereNotInStock: whereAvailabilitySaleItems(['with_stock_by_date']),
    whereNotEnoughInPrognosis: whereAvailabilitySaleItems([
      'with_prognosis_value',
    ]),
    whereNotEnoughInPrognosisWithReadyToAssembly: whereAvailabilitySaleItems([
      'with_prognosis_value_with_ready_to_assembly',
    ]),
    whereNotEnoughInPrognosisWithReadyAndExpectedToAssembly:
      whereAvailabilitySaleItems([
        'with_prognosis_value_with_ready_and_expected_to_assembly',
      ]),
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const counts = computed((oldValue) => {
  if (!!saleItemsAvailabilityByDeadlineLoading.value && !!oldValue)
    return oldValue

  const groupedBySaleId = {
    availabilityInRequest: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value?.availabilityInRequest,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),
    availabilityInDeals: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value?.availabilityInDeals,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),
    availabilityInExecuted: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value?.availabilityInExecuted,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),

    availabilityNotInStock: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value?.availabilityNotInStock,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),
    availabilityNotEnoughInPrognosis: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value
          ?.availabilityNotEnoughInPrognosis,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),
    availabilityNotEnoughInPrognosisWithReadyToAssembly: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value
          ?.availabilityNotEnoughInPrognosisWithReadyToAssembly,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),
    availabilityNotEnoughtInAllPrognosis: l.groupBy(
      l.filter(
        saleItemsAvailabilityByDeadlineResult.value
          ?.availabilityNotEnoughtInAllPrognosis,
        (row) => !l.isEmpty(row.expected_availability),
      ),
      (row) => l.get(l.first(row.expected_availability), 'sale_item.sale.id'),
    ),
  }

  return {
    request: l.size(groupedBySaleId.availabilityInRequest) ?? 0,
    deal: l.size(groupedBySaleId.availabilityInDeals) ?? 0,
    executed: l.size(groupedBySaleId.availabilityInExecuted) ?? 0,
    with_stock_by_date: l.size(groupedBySaleId.availabilityNotInStock) ?? 0,
    with_prognosis_value:
      l.size(groupedBySaleId.availabilityNotEnoughInPrognosis) ?? 0,
    with_prognosis_value_with_ready_to_assembly:
      l.size(
        groupedBySaleId.availabilityNotEnoughInPrognosisWithReadyToAssembly,
      ) ?? 0,
    with_prognosis_value_with_ready_and_expected_to_assembly:
      l.size(groupedBySaleId.availabilityNotEnoughtInAllPrognosis) ?? 0,
  }
})

// const totalSalesShortageCount = defineModel<number>(
//   'totalSalesShortageCount',
//   {
//     default: 0,
//   },
// )

watchEffect(
  () =>
    !saleItemsAvailabilityByDeadlineLoading.value &&
    emit(
      'total-count',
      counts?.value?.request + counts?.value?.deal + counts?.value?.executed,
    ),
)

const isDaysFromNowActive = ref(true)

watch(
  () => daysFromNow.value,
  () => {
    if (!l.isNumber(daysFromNow.value)) {
      isDaysFromNowActive.value = false
      tempDaysFromNow.value = daysFromNowInitial
    }
    if (l.isNumber(daysFromNow.value)) {
      isDaysFromNowActive.value = true
      tempDaysFromNow.value = daysFromNow.value
    }
  },
  { immediate: true },
)

const isDaysToShiftActive = ref(true)

watch(
  () => daysToShift.value,
  () => {
    if (!l.isNumber(daysToShift.value)) {
      isDaysToShiftActive.value = false
      tempDaysToShift.value = daysToShiftInitial
    }
    if (l.isNumber(daysToShift.value)) {
      isDaysToShiftActive.value = true
      tempDaysToShift.value = daysToShift.value
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
              v-if="!saleItemsAvailabilityByDeadlineLoading"
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

    <div class="row col items-center q-gutter-x-sm q-px-sm">
      <q-toggle
        v-model="isDaysToShiftActive"
        @update:model-value="
          (val) =>
            !val ? (daysToShift = undefined) : (daysToShift = tempDaysToShift)
        "
        dense
      >
        <q-tooltip theme="extra.delayWidth">
          {{
            isDaysToShiftActive
              ? 'Выключить фильтр по наличию за дни до дедлайна'
              : 'Включить фильтр по наличию за дни до дедлайна'
          }}
        </q-tooltip>
      </q-toggle>
      <div class="col-grow column">
        <q-badge
          v-if="l.isNumber(daysToShift)"
          :disable="!isDaysToShiftActive"
          :class="{ 'inactive-item': !isDaysToShiftActive }"
          class="self-start"
        >
          {{
            daysToShift > 0
              ? `+${Math.abs(daysToShift)} ${pluralDays(l.toNumber(daysToShift))}`
              : daysToShift < 0
                ? `-${Math.abs(daysToShift)} ${pluralDays(l.toNumber(daysToShift))}`
                : 'в день дедлайна'
          }}
        </q-badge>

        <q-slider
          v-model="tempDaysToShift"
          @change="
            (val) => {
              daysToShift = val
            }
          "
          :min="-50"
          :max="50"
          label
          :disable="!isDaysToShiftActive"
        />
      </div>
    </div>
    <div class="row col">
      <div class="q-pr-xs col-3">
        <q-btn
          @click="
            updateItemAvailabilityNetStockStatuses(
              netStockSaleItemShortageStatus.statusResult,
            )
          "
          outline
          unelevated
          :color="
            l.includes(
              selectedSaleItemStatuses,
              netStockSaleItemShortageStatus.statusResult,
            )
              ? 'primary'
              : undefined
          "
          style="height: 4rem"
          class="full-width"
        >
          <div class="column col full-width">
            <div>
              <q-icon
                :name="netStockSaleItemShortageStatus.iconName"
                :color="netStockSaleItemShortageStatus.color"
                size="xs"
              />
              <q-icon
                v-if="netStockSaleItemShortageStatus.iconName2"
                :name="netStockSaleItemShortageStatus.iconName2"
                :color="netStockSaleItemShortageStatus.color"
                size="xs"
              />
              <q-tooltip theme="extra.delayWidth">
                {{ netStockSaleItemShortageStatus.message }}
              </q-tooltip>
            </div>

            <div
              v-if="!saleItemsAvailabilityByDeadlineLoading"
              class="col column col-grow justify-center"
              key="sale-count"
            >
              <div
                class="text-h4 text-weight-thin"
                :class="
                  getTextColorClassByNumberZeroGood(
                    l.get(counts, netStockSaleItemShortageStatus.statusResult),
                  )
                "
              >
                {{ l.get(counts, netStockSaleItemShortageStatus.statusResult) }}
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
      </div>

      <div class="col">
        <q-btn-group
          spread
          outline
          style="height: 4rem"
        >
          <q-btn
            v-for="(status, index) in prognosisSaleItemShortageStatuses"
            :key="index"
            outline
            @click="
              updateItemAvailabilityPrognosisStatuses(status.statusResult)
            "
            :color="
              l.includes(selectedSaleItemStatuses, status.statusResult)
                ? 'primary'
                : undefined
            "
            :class="{
              'border-right': isLastSelectedPrognosisStatus(
                status.statusResult,
                l.toNumber(index),
              ),
            }"
          >
            <div class="column col">
              <div>
                <q-icon
                  :name="status.iconName"
                  :color="status.color"
                  size="xs"
                />
                <q-icon
                  v-if="status.iconName2"
                  :name="status.iconName2"
                  :color="status.color"
                  size="xs"
                />
                <q-tooltip theme="extra.delayWidth">
                  {{ status.message }}
                </q-tooltip>
              </div>

              <div
                v-if="!saleItemsAvailabilityByDeadlineLoading"
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
    </div>
  </VueThemer>
</template>

<style scoped lang="scss">
.inactive-item {
  opacity: 0.5;
}

.border-right {
  border-right: 1px solid $primary;
}

.border-right:last-child {
  border-right: none; /* Remove the border for the last element */
}
</style>

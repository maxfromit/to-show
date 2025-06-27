<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, watchEffect } from 'vue'
import l from 'lodash'

import { fragmentSupplyBasic } from 'src/constants/fragments'
import { getTextColorClassByNumberZeroGood } from 'src/utils/getTextColorClassByNumber'

import { whereNotConfirmedSupply } from 'src/pages/components/DashBoard/SuppliesNotConfirmed/components/where'

const emit = defineEmits<{
  (e: 'total-count', count: number): void
  (e: 'button-click'): void
}>()

const {
  result: supplyWithNotConfirmedSupplyItemsResult,
  loading: supplyWithNotConfirmedSupplyItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query SuppliesNotConfirmedFilterButtons_Supply(
      $where_supply: supply_bool_exp!
    ) {
      supply(where: $where_supply) {
        ...MainFragments_SupplyFragment
      }
    }
    ${fragmentSupplyBasic}
  `,
  () => ({
    where_supply: whereNotConfirmedSupply,
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const count = computed(() =>
  l.size(supplyWithNotConfirmedSupplyItemsResult.value?.supply),
)

watchEffect(
  () =>
    !supplyWithNotConfirmedSupplyItemsLoading.value &&
    emit('total-count', count?.value),
)
</script>

<template>
  <VueThemer>
    <div
      v-if="!supplyWithNotConfirmedSupplyItemsLoading"
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
          outline
          unelevated
          @click="emit('button-click')"
        >
          <div class="column full-height">
            <div class="text-caption text-no-wrap">
              Всего
              <q-separator />
            </div>
            <div class="col column col-grow justify-center">
              <div
                class="text-h2"
                :class="getTextColorClassByNumberZeroGood(count)"
              >
                {{ count }}
              </div>
            </div>
          </div>
        </q-btn>
        <!-- <q-btn
          v-for="warehouse in l.slice(warehouses, 0, 3)"
          :key="warehouse.id"
          outline
          unelevated
        >
          <div class="column full-height">
            <div class="text-caption text-no-wrap">
              {{ l.truncate(warehouse.name, { length: 13, omission: '...' }) }}
              <q-separator />
            </div>
            <div class="col column col-grow justify-center">
              <div
                class="text-h2"
                :class="getTextColorClassByNumber(count)"
              >
                {{ count }}
              </div>
            </div>
          </div>
        </q-btn> -->
      </q-btn-group>
    </div>

    <div
      class="q-pa-md row col-grow justify-center"
      v-if="!!supplyWithNotConfirmedSupplyItemsLoading"
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

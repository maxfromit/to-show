<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

import { computed, watchEffect } from 'vue'
import l from 'lodash'

import { fragmentAssemblyBasic } from 'src/constants/fragments'
import { getTextColorClassByNumberZeroGood } from 'src/utils/getTextColorClassByNumber'

import { whereNotConfirmedAssembly } from 'src/pages/components/DashBoard/AssembliesNotConfirmed/components/where'

const emit = defineEmits<{
  (e: 'total-count', count: number): void
  (e: 'button-click'): void
}>()

const {
  result: assemblyWithNotConfirmedAssemblyItemsResult,
  loading: assemblyWithNotConfirmedAssemblyItemsLoading,
} = useQuery(
  gql/* GraphQL */ `
    query AssembliesNotConfirmedFilterButtons_Assembly(
      $where_assembly: assembly_bool_exp!
    ) {
      assembly(where: $where_assembly) {
        ...MainFragments_AssemblyFragment
      }
    }
    ${fragmentAssemblyBasic}
  `,
  () => ({
    where_assembly: whereNotConfirmedAssembly,
  }),
  // () => ({
  //   fetchPolicy: 'no-cache',
  // }),
)

const count = computed(
  () =>
    l.size(assemblyWithNotConfirmedAssemblyItemsResult.value?.assembly) ?? 0,
)

watchEffect(
  () =>
    !assemblyWithNotConfirmedAssemblyItemsLoading.value &&
    emit('total-count', count?.value),
)
</script>

<template>
  <VueThemer>
    <div
      v-if="!assemblyWithNotConfirmedAssemblyItemsLoading"
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
          @click="$emit('button-click')"
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
      </q-btn-group>
    </div>

    <div
      class="q-pa-md row col-grow justify-center"
      v-if="!!assemblyWithNotConfirmedAssemblyItemsLoading"
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

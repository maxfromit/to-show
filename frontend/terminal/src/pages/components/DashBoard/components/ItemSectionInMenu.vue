<script setup lang="ts">
import l from 'lodash'
import { findSaleType } from 'src/utils/handleSaleStatus'
import { formatToDDMMYY } from 'src/utils/dateFormatter'

const props = defineProps<{
  label?: string
  value: string | number
  moscowDate?: boolean
  ISODate?: boolean
  status?: boolean
}>()
</script>

<template>
  <VueThemer>
    <q-item>
      <q-item-section>
        <q-item-label>{{ props.label }}</q-item-label>
        <q-item-label
          caption
          v-if="!!props.status && l.isString(props.value)"
        >
          {{ l.get(findSaleType(props.value), 'label') }}
        </q-item-label>

        <q-item-label
          caption
          v-if="!!props.moscowDate"
        >
          {{ l.isString(props.value) ? formatToDDMMYY(props.value) : '–' }}
        </q-item-label>

        <q-item-label
          caption
          v-if="!!props.ISODate"
        >
          {{ l.isString(props.value) ? formatToDDMMYY(props.value) : '–' }}
        </q-item-label>

        <q-item-label
          caption
          v-if="!props.status && !props.moscowDate && !props.ISODate"
        >
          {{ props.value ? props.value : '–' }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </VueThemer>
</template>

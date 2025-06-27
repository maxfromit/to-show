<script setup lang="ts">
import SaleItemsDeliveredTable from 'src/pages/components/DashBoard/SaleItemsDelivered/SaleItemsDeliveredTable.vue'
import SaleItemsDeliveredFilterButtons from 'src/pages/components/DashBoard/SaleItemsDelivered/SaleItemsDeliveredFilterButtons.vue'
import DashboardCard from 'src/pages/components/DashBoard/components/DashboardCard/DashboardCard.vue'
import { getDaysFromNowLabel } from 'src/pages/components/DashBoard/utils/getDaysFromNowLabel'

defineProps<{
  mobile?: boolean
  daysFromNow?: number
  productIds?: number[]
}>()

const emit = defineEmits<{
  (e: 'update:product-ids', val: number[]): void
  (e: 'update:days-from-now', days?: number): void
}>()

const textFilter = defineModel<string | null>('textFilter', {
  default: null,
})
</script>

<template>
  <VueThemer>
    <DashboardCard
      :mobile="mobile"
      expandedMode
      tallTable
    >
      <template #card-controls>
        <slot name="card-controls"></slot>
      </template>

      <template #header>
        Реализованные позиции
        <q-tooltip theme="extra.delayWidth">
          Позиции, доставленные до клиентов
        </q-tooltip></template
      >

      <template #detailed>
        <div>
          Период:
          <span style="font-weight: bold">
            {{ getDaysFromNowLabel(daysFromNow, 'с') }}</span
          >
        </div>
      </template>
      <template #filter>
        <SaleItemsDeliveredFilterButtons
          :days-from-now="daysFromNow"
          :productIds="productIds"
          @update:product-ids="(val) => emit('update:product-ids', val)"
          @update:days-from-now="(val) => emit('update:days-from-now', val)"
      /></template>

      <template #table>
        <SaleItemsDeliveredTable
          :product-ids="productIds"
          :days-from-now="daysFromNow"
          v-model:text-filter="textFilter"
        />
      </template>
    </DashboardCard>
  </VueThemer>
</template>

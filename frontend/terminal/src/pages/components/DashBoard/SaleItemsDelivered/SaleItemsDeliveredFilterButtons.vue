<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import l from 'lodash'
import { pluralDays } from 'src/pages/sales/utils/plural'
import { daysFromNowInitial } from './components/initialDaysShifting'
import MultilpleSelectProductWithFilterIdsAsModuleValue from 'src/pages/components/MultilpleSelectProductWithFilter/MultilpleSelectProductWithFilterIdsAsModuleValue.vue'
import ItemListWithRemove from 'src/pages/components/ItemListWithRemove/ItemListWithRemove.vue'
import { whereProductMovesSaleItemsDeliveredForDays } from './components/where'

defineProps<{
  productIds?: number[]
}>()

const emit = defineEmits<{
  (e: 'update:product-ids', val: number[]): void
}>()

const daysFromNow = defineModel<number | undefined>('daysFromNow', {
  default: undefined,
})

const arrayMarkerLabel = [
  { value: -730, label: '-730' },
  { value: -550, label: '-550' },
  { value: -365, label: '-365' },
  { value: -180, label: '-180' },
]

const tempDaysFromNow = ref(daysFromNow.value)

// TODO: use whereProduct from SaleItemsDeliveredTable

const whereProductMoves = computed(() => {
  return {
    product_moves: whereProductMovesSaleItemsDeliveredForDays(
      daysFromNow.value,
    ),
  }
})

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
              ? 'Выключить фильтр по времени реализации'
              : 'Включить фильтр по времени реализации'
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
              ? `за будущие ${Math.abs(daysFromNow)} ${pluralDays(l.toNumber(daysFromNow))}`
              : daysFromNow < 0
                ? `за прошедшие ${Math.abs(daysFromNow)} ${pluralDays(l.toNumber(daysFromNow))}`
                : 'за сегодня'
          }}
        </q-badge>

        <q-slider
          v-model="tempDaysFromNow"
          @change="
            (val) => {
              daysFromNow = val
            }
          "
          :min="-730"
          :max="0"
          :marker-labels="isDaysFromNowActive ? arrayMarkerLabel : false"
          label
          :disable="!isDaysFromNowActive"
          class="col-grow"
        >
          <template #marker-label-group="{ markerList }">
            <div
              v-for="marker in markerList"
              :key="marker.value"
              class="cursor-pointer"
              :class="marker.classes"
              :style="marker.style"
              @click="daysFromNow = marker.value"
            >
              {{ marker.label }}
            </div>
          </template>
        </q-slider>
      </div>

      <q-btn theme="table.action">
        <q-icon name="svguse:/icons.svg#filter">
          <q-badge
            v-if="!l.isEmpty(productIds)"
            floating
            >{{ l.size(productIds) }}
          </q-badge>
        </q-icon>
        <q-menu no-route-dismiss>
          <div
            class="q-pa-md q-gutter-y-sm"
            style="width: 19rem; max-height: 20rem; min-height: 10rem"
          >
            <div class="row items-center justify-between no-wrap">
              <div class="text-uppercase">Фильтр по позициям</div>
              <q-btn
                icon="svguse:/icons.svg#close-circle"
                dense
                flat
                round
                color="grey"
                @click="emit('update:product-ids', [])"
                :disable="l.isEmpty(productIds)"
                size="sm"
              >
                <q-tooltip>
                  {{
                    !l.isEmpty(productIds)
                      ? 'Сбросить выбор'
                      : 'Нет выбранных позиций'
                  }}</q-tooltip
                >
              </q-btn>
            </div>
            <MultilpleSelectProductWithFilterIdsAsModuleValue
              :theme="'list.filter'"
              :selectedProducts="productIds"
              @update:allSelectedProductsIds="
                (val) => emit('update:product-ids', val)
              "
              :custom-where="whereProductMoves"
              freestyle
            />
            <ItemListWithRemove
              :lines="1"
              :mode="'product'"
              :itemIds="productIds"
              @update:itemIds="
                (val: number[]) => emit('update:product-ids', val)
              "
              dense
            />
          </div>
        </q-menu>
        <q-tooltip theme="extra.delayWidth"> Фильтр по позициям </q-tooltip>
      </q-btn>
    </div>
  </VueThemer>
</template>

<style scoped lang="scss">
.inactive-item {
  opacity: 0.5;
}

.bordered-div {
  border: 1px solid #000; /* Adjust the border color and width as needed */
  padding: 1rem; /* Optional: Add padding for better appearance */
}
</style>

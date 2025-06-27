<script setup lang="ts">
import l from 'lodash'
import { labelByEntity } from 'src/constants/labels'

import { formatToDDMMYY } from 'src/utils/dateFormatter'
import { useProductMoveNames } from 'src/composables/useProductMoveItemAndName'
import {
  getToName,
  getTitle,
  productName,
} from 'src/composables/useLinksCategoriesAndGetItByRouter'
import { formatToDatePickerFormat } from 'src/utils/dateCalculation'
import pluralize from 'pluralize'

const props = defineProps<{
  entity: string
  entityId: number
  supplyType?: string
  items: Item[]
  header?: string
  caption?: string
  selectedSaleItemShortageStatuses?: string[]
}>()

type Item = {
  id: number
  product_id?: number
  deadline?: string
  planned_at?: string
  count?: number
  product?: {
    id?: number
    bundle_id?: number | null
    sku: string
    name: string
  } | null
  product_moves?: {
    warehouse_id: number
    warehouse: {
      name: string
    }
  }[]
  availability?: {
    pending_count_by_date: number
    with_stock_by_date: number
    with_prognosis_value: number
    with_prognosis_value_with_ready_to_assembly: number
    with_prognosis_value_with_ready_and_expected_to_assembly: number
    evaluation_at: string
  }
}

const { getProductMoveName } = useProductMoveNames()
</script>

<template>
  <VueThemer>
    <q-list
      bordered
      separator
      padding
    >
      <q-item>
        <q-item-section>
          <q-item-label overline>{{ props?.header }}</q-item-label>
          <q-item-label caption>
            {{ props.caption }}
          </q-item-label>
        </q-item-section>

        <q-item-section
          side
          top
        >
          <q-item-label caption>Всего: {{ l.size(items) }}</q-item-label>
        </q-item-section>
      </q-item>

      <div
        v-for="item in items"
        :key="item.id"
      >
        <q-separator spaced />
        <q-item>
          <q-item-section>
            <q-item-label class="text-uppercase">
              {{
                item?.product?.bundle_id ? 'Комплект' : 'Товар'
              }}</q-item-label
            >
            <q-item-label
              caption
              lines="1"
            >
              "{{ item?.product?.sku }} – {{ item?.product?.name }}"
              <q-tooltip
                :delay="500"
                class="text-caption"
                max-width="20rem"
              >
                {{ item?.product?.sku }} – {{ item?.product?.name }}
              </q-tooltip></q-item-label
            >
          </q-item-section>

          <q-item-section
            side
            top
          >
            <q-btn
              theme="table.action"
              :to="{
                name: getToName({
                  explicitPathStart: '/' + pluralize(props.entity),
                  ...(props.supplyType ? { supplyType: props.supplyType } : {}),
                }),
                params: {
                  ...(props.supplyType ? { supplyType: props.supplyType } : {}),
                  [`${props.entity}Id`]: props.entityId,
                  [`${props.entity}Mode`]: 'view',
                  [`${props.entity}ItemId`]: item.id,
                },
              }"
              :icon="'svguse:/icons.svg#arrow-right'"
            >
              <q-tooltip
                :delay="500"
                class="text-caption"
              >
                Смотреть
                {{
                  l.lowerCase(
                    getProductMoveName(
                      `${props.entity}_item_id`,
                      props.supplyType ?? undefined,
                    ),
                  )
                }}
                {{ item?.product?.bundle_id ? 'комплекта' : 'товара' }}
              </q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-item v-if="l.has(item, 'count')">
          <q-item-section>
            <q-item-label>
              {{
                l.get(
                  labelByEntity,
                  `${props.entity}_item.${props.supplyType ? `${props.supplyType}.` : ''}count`,
                )
              }}
            </q-item-label>

            <q-item-label
              caption
              lines="1"
            >
              {{ item?.count }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="l.has(item, 'deadline') || l.has(item, 'planned_at')">
          <q-item-section>
            <q-item-label v-if="l.has(item, 'planned_at')">
              {{
                l.get(
                  labelByEntity,
                  `${props.entity}_item.${props.supplyType ? `${props.supplyType}.` : ''}${props.entity === 'relocation' ? `planned_in_at` : 'planned_at'}`,
                )
              }}
            </q-item-label>

            <q-item-label v-if="l.has(item, 'deadline')">
              {{
                l.get(
                  labelByEntity,
                  `${props.entity}_item.${props.supplyType ? `${props.supplyType}.` : ''}deadline`,
                )
              }}
            </q-item-label>

            <q-item-label caption>
              {{
                l.has(item, 'planned_at') || l.has(item, 'deadline')
                  ? formatToDDMMYY(
                      item?.planned_at
                        ? item?.planned_at
                        : item?.deadline ?? '',
                    )
                  : 'нет даты'
              }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <template v-if="l.has(item, 'availability')">
          <q-separator
            spaced
            inset
          />

          <q-item>
            <q-item-section>
              <q-item-label overline>
                Доступность с учетом ожидаемого развоза
                <div v-if="item?.availability?.evaluation_at">
                  на {{ formatToDDMMYY(item?.availability?.evaluation_at) }}
                </div>
              </q-item-label>
            </q-item-section>

            <q-item-section
              side
              top
            >
              <q-btn
                theme="table.action"
                :to="{
                  name: getToName({ explicitPathStart: '/report-date' }),
                  params: { productId: item.product_id },
                  ...(!!item?.availability?.evaluation_at
                    ? {
                        query: {
                          date: formatToDatePickerFormat(
                            item?.availability?.evaluation_at,
                          ),
                        },
                      }
                    : {}),
                }"
                :icon="'svguse:/icons.svg#arrow-right'"
                size="sm"
              >
                <q-tooltip
                  class="text-caption selected-element text-center"
                  :delay="500"
                  style="width: 10rem"
                  >Перейти в отчет
                  {{
                    getTitle(undefined, '/report-date') !== productName
                      ? `"${getTitle(undefined, '/report-date')}"`
                      : ''
                  }}
                </q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label> Незарезервировано в заказе</q-item-label>
              <q-item-label caption>
                {{ item?.availability?.pending_count_by_date }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            :active="
              l.includes(selectedSaleItemShortageStatuses, 'with_stock_by_date')
            "
          >
            <q-item-section>
              <q-item-label> C учетом наличия </q-item-label>
              <q-item-label
                :caption="
                  !l.includes(
                    selectedSaleItemShortageStatuses,
                    'with_stock_by_date',
                  )
                "
              >
                {{ item?.availability?.with_stock_by_date }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            :active="
              l.includes(
                selectedSaleItemShortageStatuses,
                'with_prognosis_value',
              )
            "
          >
            <q-item-section>
              <q-item-label> С учетом предполагаемого баланса</q-item-label>
              <q-item-label
                :caption="
                  !l.includes(
                    selectedSaleItemShortageStatuses,
                    'with_prognosis_value',
                  )
                "
              >
                {{ item?.availability?.with_prognosis_value }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            :active="
              l.includes(
                selectedSaleItemShortageStatuses,
                'with_prognosis_value_with_ready_to_assembly',
              )
            "
          >
            <q-item-section>
              <q-item-label v-if="item?.product?.bundle_id">
                С учетом предполагаемого баланса и с учетом возможных
                комплектаций
              </q-item-label>
              <q-item-label
                :caption="
                  !l.includes(
                    selectedSaleItemShortageStatuses,
                    'with_prognosis_value_with_ready_to_assembly',
                  )
                "
              >
                {{
                  item?.availability
                    ?.with_prognosis_value_with_ready_to_assembly
                }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            :active="
              l.includes(
                selectedSaleItemShortageStatuses,
                'with_prognosis_value_with_ready_and_expected_to_assembly',
              )
            "
          >
            <q-item-section>
              <q-item-label v-if="item?.product?.bundle_id">
                С учетом предполагаемого баланса и с учетом возможных
                комплектаций и с учетом комплектаций из ожидаемых поступлений
              </q-item-label>
              <q-item-label
                :caption="
                  !l.includes(
                    selectedSaleItemShortageStatuses,
                    'with_prognosis_value_with_ready_and_expected_to_assembly',
                  )
                "
              >
                {{
                  item?.availability
                    ?.with_prognosis_value_with_ready_and_expected_to_assembly
                }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <template v-if="l.has(item, 'product_moves')">
          <q-item>
            <q-item-section>
              <q-item-label>
                {{
                  l.get(
                    labelByEntity,
                    `${props.entity}_item.${props.supplyType ? `${props.supplyType}.` : ''}${props.entity === 'relocation' ? `warehouse_in_id` : 'warehouse_id'}`,
                  )
                }}
              </q-item-label>
              <q-item-label caption>
                {{
                  l
                    .chain(item?.product_moves)
                    .map((move) => move.warehouse.name)
                    .uniq()
                    .join(', ')
                    .value()
                }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </div>
    </q-list>
  </VueThemer>
</template>

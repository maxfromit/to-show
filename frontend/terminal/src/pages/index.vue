<route lang="json">
{
  "props": "(route) => route.query"
}
</route>

<script setup lang="ts">
import { ref, computed, watchEffect, watch } from "vue"
import { useQuasar } from "quasar"

import { useRouter } from "vue-router"
import l from "lodash"
import draggable from "vuedraggable"

import PageTemplate from "pages/components/PageTemplate.vue"
import MobilePager from "./components/MobilePager.vue"

import SalesPendingCard from "src/pages/components/DashBoard/components/EntityCards/SalesPendingCard/SalesPendingCard.vue"
import SalesAvailabilityCard from "src/pages/components/DashBoard/components/EntityCards/SalesAvailabilityCard/SalesAvailabilityCard.vue"
import ProductsShortageCard from "./components/DashBoard/components/EntityCards/ProductsShortageCard/ProductsShortageCard.vue"
import SaleItemsDeliveredCard from "src/pages/components/DashBoard/components/EntityCards/SaleItemsDeliveredCard/SaleItemsDeliveredCard.vue"
import SalesDebtCard from "src/pages/components/DashBoard/components/EntityCards/SalesDebtCard/SalesDebtCard.vue"
import SalesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/SalesNotConfirmedCard/SalesNotConfirmedCard.vue"
import SuppliesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/SuppliesNotConfirmedCard/SuppliesNotConfirmedCard.vue"
import RelocationsNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/RelocationsNotConfirmedCard/RelocationsNotConfirmedCard.vue"
import AssembliesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/AssembliesNotConfirmedCard/AssembliesNotConfirmedCard.vue"
import DisassembliesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/DisassembliesNotConfirmedCard/DisassembliesNotConfirmedCard.vue"
import CardHandleAndVisibility from "src/pages/components/DashBoard/components/CardControls/CardHandleAndVisibility/CardHandleAndVisibility.vue"
import CardsViewCustomizerFab from "src/pages/components/DashBoard/components/CardControls/CardsViewCustomizerFab/CardsViewCustomizerFab.vue"
import CardsExpandButton from "src/pages/components/DashBoard/components/CardControls/CardsExpandButton/CardsExpandButton.vue"
import CardsSettingsToSaveDialog from "src/pages/components/DashBoard/components/CardsSettingsToSaveDialog/CardsSettingsToSaveDialog.vue"

import type {
  ExpandState,
  VisibilityState,
  CardName,
  CardNamesLowerFirst,
} from "src/pages/components/DashBoard/types"
import type { OptionNumber } from "src/types/optionTypes"

import { getTitle } from "src/composables/useLinksCategoriesAndGetItByRouter"
import { defaultCardsOrder } from "src/pages/components/DashBoard/const"
import { useGetProductData } from "src/composables/useGetNameById"
import { Dialog, Notify } from "quasar"
import { useSettings } from "src/composables/useSettings"
import { transformObjectKeysToKebabCase } from "src/utils/keysToKebabCase"
import { initialCardsStateOptions } from "./components/DashBoard/components/CardsSettingsToSaveDialog/components/cardsStateOptions"

const props = defineProps<{
  salesDebtStatuses?: string
  salesPendingStatuses?: string
  salesPendingDaysFromNow?: string
  salesAvailabilityStatuses?: string
  saleItemAvailabilityStatuses?: string
  productShortageStatuses?: string
  productShortageDaysFromNow?: string
  salesAvailabilityDaysFromNow?: string
  salesAvailabilityDaysToShift?: string
  salesNotConfirmedStatuses?: string
  saleItemPendingStatuses?: string
  saleItemsDeliveredDaysFromNow?: string
  saleItemsDeliveredProductIds?: string
  saleItemsDeliveredText?: string
}>()

const $q = useQuasar()
const router = useRouter()

const { getProductNameSkuById } = useGetProductData()

const separator = "~"
const currentPageKey = computed(() => router.currentRoute.value.path)

const { getPageSettings, savePageSettings } = useSettings()

const { settings: pageSettings, loading: pageSetttingsLoading } =
  getPageSettings(currentPageKey.value)

type PossibleTypesForAutoTransform = number | string | string[] | OptionNumber[]

const goToChoosenFilter = (
  newValue: PossibleTypesForAutoTransform | null,
  propsName: string
) => {
  function isOptionNumberArray(val: PossibleTypesForAutoTransform) {
    return l.isArray(val) && l.every(val, (item) => l.has(item, "value"))
  }

  function isValueFilled(val: unknown): boolean {
    return (
      l.isNumber(val) ||
      ((l.isString(val) || l.isArray(val)) && !l.isEmpty(val))
    )
  }

  function trasnformValueForQuery(val: PossibleTypesForAutoTransform) {
    if (l.isArray(val) && isOptionNumberArray(val))
      return l.chain(val).map("value").join(separator).value()
    if (l.isArray(val)) return l.join(val, separator)
    if (l.isNumber(val) || l.isString(val)) return val
    return ""
  }
  const query = {
    ...(isValueFilled(newValue)
      ? {
          ...l.pickBy(props, (val) => !!val),
          [propsName]: trasnformValueForQuery(newValue),
        }
      : {
          ...l.pickBy(l.omit(props, [propsName]), (val) => !!val),
        }),
  }

  return router.push({
    name: "/",
    query: transformObjectKeysToKebabCase(query),
  })
}

const goToFilter = (query: Partial<typeof props>) => {
  return router.push({
    name: "/",
    query: transformObjectKeysToKebabCase(query),
  })
}

// const getProps = () => props

const activeQuery = computed(() => l.pickBy(props, (val) => !!val))

const defaultCardsState: {
  expandState: Record<
    Exclude<CardNamesLowerFirst, "saleItemsDeliveredCard">,
    ExpandState
  >
  visibilityState: Record<CardNamesLowerFirst, VisibilityState>
  order: CardName[]
  query: Partial<typeof props>
} = {
  expandState: {
    salesAvailabilityCard: "collapsed",
    productsShortageCard: "collapsed",
    salesPendingCard: "collapsed",
    salesDebtCard: "collapsed",
    salesNotConfirmedCard: "collapsed",
    suppliesNotConfirmedCard: "collapsed",
    relocationsNotConfirmedCard: "collapsed",
    assembliesNotConfirmedCard: "collapsed",
    disassembliesNotConfirmedCard: "collapsed",
  },
  visibilityState: {
    salesAvailabilityCard: "shown",
    salesPendingCard: "shown",
    salesDebtCard: "shown",
    salesNotConfirmedCard: "shown",
    productsShortageCard: "shown",
    suppliesNotConfirmedCard: "shown",
    relocationsNotConfirmedCard: "shown",
    assembliesNotConfirmedCard: "shown",
    disassembliesNotConfirmedCard: "shown",
    saleItemsDeliveredCard: "shown",
  },
  order: [...defaultCardsOrder],
  query: {},
} as const

const initialCardsState = ref<typeof defaultCardsState>(null)
const cardsState = ref<typeof defaultCardsState>(null)

watch(
  () => pageSettings.value,
  async (newValue) => {
    initialCardsState.value = l.isEmpty(newValue)
      ? l.cloneDeep(defaultCardsState)
      : l.merge(l.cloneDeep(defaultCardsState), newValue)

    if (cardsState.value)
      cardsState.value = l.isEmpty(newValue)
        ? cardsState.value
        : l.cloneDeep(initialCardsState.value)

    if (!cardsState.value)
      cardsState.value = l.cloneDeep(initialCardsState.value)

    if (!l.isEqual(l.get(newValue, "query") ?? {}, activeQuery.value))
      await goToFilter(l.get(newValue, "query") ?? {})
  },
  { immediate: true, deep: true }
)

watch(
  () => activeQuery.value,
  (newValue) => {
    cardsState.value.query = newValue
  },
  { deep: true, immediate: true }
)

const isAnyCardHidden = computed(() =>
  l.some(cardsState.value.visibilityState, (status) => status === "hidden")
)

const cardsStateOptions = ref([...initialCardsStateOptions])

const savableKeys = l.map(cardsStateOptions.value, "value")

const isDefaultCardsStateChanged = computed(() => {
  return !l.isEqual(
    l.pick(defaultCardsState, savableKeys),
    l.pick(cardsState.value, savableKeys)
  )
})

const isInitialCardsStateChanged = computed(() => {
  return !l.isEqual(
    l.pick(initialCardsState.value, savableKeys),
    l.pick(cardsState.value, savableKeys)
  )
})

const isStateValueChanged = (value: string) => {
  return !l.isEqual(
    l.get(cardsState.value, value),
    l.get(initialCardsState.value, value)
  )
}

watchEffect(() =>
  l.forEach(cardsStateOptions.value, (option) => {
    option.status = isStateValueChanged(option.value) ? "active" : "unchanged"
  })
)

const selectedCardsStateToSave = computed(() => {
  const activeKeys = l.map(
    l.filter(cardsStateOptions.value, { status: "active" }),
    "value"
  )
  return l.pick(cardsState.value, activeKeys)
})

const unselectedCardsStateInInitial = computed(() => {
  const inactiveKeys = l.map(
    l.filter(cardsStateOptions.value, (option) => option.status !== "active"),
    "value"
  )
  return l.pick(initialCardsState.value, inactiveKeys)
})

async function updateCardsStateAndSaveChanges() {
  cardsState.value = l.merge(
    l.cloneDeep(cardsState.value),
    unselectedCardsStateInInitial.value
  )

  await savePageSettings(
    currentPageKey.value,
    l.pick(cardsState.value, savableKeys)
  )
}

const saveSelectedCardsStateAndNotify = async () => {
  await updateCardsStateAndSaveChanges()
    .then(() =>
      Notify.create({
        type: "positive",
        message: `${
          selectedCardsStateToSave.value
            ? "Настройки карточек сохранены"
            : "Настройки карточек сброшены"
        }`,
      })
    )
    .catch(() => {
      Notify.create({
        type: "negative",
        message: "Не удалось сбросить настройки карточек",
      })
    })
}

const isCustomizing = ref(false)

const allCardExpandState = computed(() =>
  l.every(
    cardsState.value.expandState,
    (status) => status === "nothing-to-show"
  )
    ? "all-nothing-to-show"
    : l.every(
        cardsState.value.expandState,
        (status) => status === "expanded" || status === "nothing-to-show"
      )
    ? "all-possible-expanded"
    : "expandable"
)

export type AllCardExpandState = typeof allCardExpandState.value

function changeCardExpandStateForAll() {
  const getNewValue = () => {
    if (allCardExpandState.value === "all-possible-expanded") return "collapsed"
    if (allCardExpandState.value === "expandable") return "expanded"
    if (allCardExpandState.value === "all-nothing-to-show") return
  }
  const newValue = getNewValue()
  l.forEach(cardsState.value.expandState, (val, key) => {
    if (val !== "nothing-to-show") cardsState.value.expandState[key] = newValue
  })
}

const cardExpandStateToPreserve = ref<typeof cardsState.value.expandState>(null)

function onDragStart() {
  cardExpandStateToPreserve.value = l.cloneDeep(cardsState.value.expandState)
}

function onDragEnd() {
  cardsState.value.expandState = l.cloneDeep(cardExpandStateToPreserve.value)
}

const cards = computed(() => [
  {
    id: "ProductsShortageCard",
    component: ProductsShortageCard,
    props: {
      productStatuses: !l.isEmpty(props.productShortageStatuses)
        ? l.split(props.productShortageStatuses, separator)
        : [],
      daysFromNow: props.productShortageDaysFromNow
        ? l.toNumber(props.productShortageDaysFromNow)
        : undefined,
      expandState: cardsState.value?.expandState?.productsShortageCard,
    },
    on: {
      "update:product-statuses": (val: string[]) =>
        goToChoosenFilter(val, "productShortageStatuses"),
      "update:days-from-now": (val: number) =>
        goToChoosenFilter(val, "productShortageDaysFromNow"),
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.productsShortageCard = val),
    },
  },
  {
    id: "SalesAvailabilityCard",
    component: SalesAvailabilityCard,
    props: {
      saleStatuses: !l.isEmpty(props.salesAvailabilityStatuses)
        ? l.split(props.salesAvailabilityStatuses, separator)
        : [],
      saleItemStatuses: !l.isEmpty(props.saleItemAvailabilityStatuses)
        ? l.split(props.saleItemAvailabilityStatuses, separator)
        : [],
      daysFromNow: props.salesAvailabilityDaysFromNow
        ? l.toNumber(props.salesAvailabilityDaysFromNow)
        : undefined,
      daysToShift: props.salesAvailabilityDaysToShift
        ? l.toNumber(props.salesAvailabilityDaysToShift)
        : undefined,
      expandState: cardsState.value.expandState.salesAvailabilityCard,
    },
    on: {
      "update:sale-statuses": (val: string[]) =>
        goToChoosenFilter(val, "salesAvailabilityStatuses"),
      "update:sale-item-statuses": (val: string[]) =>
        goToChoosenFilter(val, "saleItemAvailabilityStatuses"),
      "update:days-from-now": (val: number) =>
        goToChoosenFilter(val, "salesAvailabilityDaysFromNow"),
      "update:days-to-shift": (val: number) =>
        goToChoosenFilter(val, "salesAvailabilityDaysToShift"),
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.salesAvailabilityCard = val),
    },
  },
  {
    id: "SalesPendingCard",
    component: SalesPendingCard,
    props: {
      saleStatuses: !l.isEmpty(props.salesPendingStatuses)
        ? l.split(props.salesPendingStatuses, separator)
        : [],
      saleItemStatuses: !l.isEmpty(props.saleItemPendingStatuses)
        ? l.split(props.saleItemPendingStatuses, separator)
        : [],
      daysFromNow: props.salesPendingDaysFromNow
        ? l.toNumber(props.salesPendingDaysFromNow)
        : undefined,
      expandState: cardsState.value.expandState.salesPendingCard,
    },
    on: {
      "update:sale-statuses": (val: string[]) =>
        goToChoosenFilter(val, "salesPendingStatuses"),
      "update:sale-item-statuses": (val: string[]) =>
        goToChoosenFilter(val, "saleItemPendingStatuses"),
      "update:days-from-now": (val: number) =>
        goToChoosenFilter(val, "salesPendingDaysFromNow"),
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.salesPendingCard = val),
    },
  },
  {
    id: "SalesDebtCard",
    component: SalesDebtCard,
    props: {
      saleStatuses: !l.isEmpty(props.salesDebtStatuses)
        ? l.split(props.salesDebtStatuses, separator)
        : [],
      expandState: cardsState.value.expandState.salesDebtCard,
    },
    on: {
      "update:sale-statuses": (val: string[]) =>
        goToChoosenFilter(val, "salesDebtStatuses"),
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.salesDebtCard = val),
    },
  },
  {
    id: "SalesNotConfirmedCard",
    component: SalesNotConfirmedCard,
    props: {
      saleStatuses: !l.isEmpty(props.salesNotConfirmedStatuses)
        ? l.split(props.salesNotConfirmedStatuses, separator)
        : [],
      expandState: cardsState.value.expandState.salesNotConfirmedCard,
    },
    on: {
      "update:sale-statuses": (val: string[]) =>
        goToChoosenFilter(val, "salesNotConfirmedStatuses"),
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.salesNotConfirmedCard = val),
    },
  },
  {
    id: "SuppliesNotConfirmedCard",
    component: SuppliesNotConfirmedCard,
    props: {
      expandState: cardsState.value.expandState.suppliesNotConfirmedCard,
    },
    on: {
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.suppliesNotConfirmedCard = val),
    },
  },
  {
    id: "RelocationsNotConfirmedCard",
    component: RelocationsNotConfirmedCard,
    props: {
      expandState: cardsState.value.expandState.relocationsNotConfirmedCard,
    },
    on: {
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.relocationsNotConfirmedCard = val),
    },
  },
  {
    id: "AssembliesNotConfirmedCard",
    component: AssembliesNotConfirmedCard,
    props: {
      expandState: cardsState.value.expandState.assembliesNotConfirmedCard,
    },
    on: {
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.assembliesNotConfirmedCard = val),
    },
  },
  {
    id: "DisassembliesNotConfirmedCard",
    component: DisassembliesNotConfirmedCard,
    props: {
      expandState: cardsState.value.expandState.disassembliesNotConfirmedCard,
    },
    on: {
      "update:expand-state": (val: ExpandState) =>
        (cardsState.value.expandState.disassembliesNotConfirmedCard = val),
    },
  },
  {
    id: "SaleItemsDeliveredCard",
    component: SaleItemsDeliveredCard,
    props: {
      selectedProducts: !l.isEmpty(props.saleItemsDeliveredProductIds)
        ? l.map(
            l.split(props.saleItemsDeliveredProductIds, separator),
            (id) => ({
              value: l.toNumber(id),
              label: getProductNameSkuById(l.toNumber(id)) ?? "",
            })
          )
        : [],
      daysFromNow: props.saleItemsDeliveredDaysFromNow
        ? l.toNumber(props.saleItemsDeliveredDaysFromNow)
        : undefined,
      textFilter: props.saleItemsDeliveredText ?? null,
    },
    on: {
      "update:days-from-now": (val: number) =>
        goToChoosenFilter(val, "saleItemsDeliveredDaysFromNow"),

      "update:selected-products": (val: OptionNumber[]) =>
        goToChoosenFilter(val, "saleItemsDeliveredProductIds"),

      "update:text-filter": (val: string | null) =>
        goToChoosenFilter(val, "saleItemsDeliveredText"),
    },
  },
])

const findedCard = (id: string) => l.find(cards.value, { id })

const isDialogWhatWillBeChoosenToSaveOpen = ref(false)

const resetCardsState = async () => {
  if (!isDefaultCardsStateChanged.value) return

  Dialog.create({
    title: "Вернуть первоначальное состояние?",
    message: "Состояние всех карточек будет сброшено на первоначальное.",
    cancel: {
      label: "Отмена",
      noCaps: true,
      unelevated: true,
      flat: true,
    },
    ok: {
      color: "primary",
      unelevated: true,
      label: "Вернуть",
      noCaps: true,
    },
  }).onOk(() => {
    cardsState.value = l.cloneDeep(defaultCardsState)
    isCustomizing.value = !isCustomizing.value
    if (!l.isEmpty(pageSettings.value)) {
      void savePageSettings(currentPageKey.value, null)
        .then(() =>
          Notify.create({
            type: "positive",
            message:
              "Личные настройки карточек удалены и сброшены на первоначальные",
          })
        )
        .catch(() => {
          Notify.create({
            type: "negative",
            message: "Не удалось сбросить настройки карточек",
          })
        })
    }
  })
}

const tabs = ["detail"]

const tab = ref("detail")
</script>

<template>
  <VueThemer>
    <MobilePager v-if="$q.screen.xs" :tabs="tabs" :tab="tab">
      <template #list>
        <PageTemplate>
          <template #navbar-content>
            {{ getTitle(router) }}
          </template>

          <q-page class="row">
            <q-card class="col column position-relative no-border-radius">
            </q-card>
          </q-page>
        </PageTemplate>
      </template>

      <template #detail>
        <PageTemplate>
          <!-- <template #left-button>
            <q-btn
              theme="toolbar.back"
              icon="svguse:/icons.svg#alt-arrow-left"
              @click="goBack"
            />
          </template> -->

          <template #navbar-content>
            {{ getTitle(router) }}
          </template>

          <q-page padding class="column background-grey q-gutter-y-md">
            <q-linear-progress
              v-if="pageSetttingsLoading"
              indeterminate
              size="xs"
              color="primary"
            />

            <template v-if="!pageSetttingsLoading">
              <div class="row justify-around items-start q-pt-sm">
                <CardsViewCustomizerFab
                  :is-any-card-hidden="isAnyCardHidden"
                  :is-cards-state-changed="isDefaultCardsStateChanged"
                  :is-initial-cards-state-changed="isInitialCardsStateChanged"
                  v-model="isCustomizing"
                  @open-dialog="isDialogWhatWillBeChoosenToSaveOpen = true"
                  @reset="resetCardsState"
                  mobile
                />

                <CardsExpandButton
                  v-if="allCardExpandState != 'all-nothing-to-show'"
                  :all-card-expand-state="allCardExpandState"
                  @change-expand="changeCardExpandStateForAll()"
                />
              </div>

              <q-list
                v-if="isCustomizing"
                bordered
                padding
                class="border-accent"
              >
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Сохраняемые параметры:</q-item-label>
                    <q-item-label caption>
                      <q-item-section>{{
                        l
                          .map(cardsStateOptions, (option) =>
                            l.lowerCase(option.label)
                          )
                          .join(", ")
                      }}</q-item-section>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <draggable
                v-model="cardsState.order"
                @start="onDragStart()"
                @end="onDragEnd()"
                handle=".drag-handle"
                item-key="id"
                class="column q-gutter-md"
                :disabled="!isCustomizing"
              >
                <template #item="{ element }">
                  <div
                    v-if="
                      cardsState.visibilityState[l.lowerFirst(element)] ===
                        'shown' || isCustomizing
                    "
                    :class="{
                      'inactive-item':
                        cardsState.visibilityState[l.lowerFirst(element)] ===
                        'hidden',
                    }"
                  >
                    <KeepAlive>
                      <component
                        :is="findedCard(element).component"
                        v-bind="{
                          ...findedCard(element).props,
                          mobile: true,
                        }"
                        v-on="findedCard(element).on"
                        :key="element"
                      >
                        <template v-if="isCustomizing" #card-controls>
                          <div
                            class="row items-center background-grey bordered q-pa-xs"
                          >
                            <CardHandleAndVisibility
                              v-model="
                                cardsState.visibilityState[
                                  l.lowerFirst(element)
                                ]
                              "
                            />
                          </div>
                        </template>
                      </component>
                    </KeepAlive>
                  </div>
                </template>
              </draggable>
            </template>
          </q-page>
        </PageTemplate>
      </template>
    </MobilePager>

    <PageTemplate v-else>
      {{ pageSetttingsLoading }}
      <q-page class="row no-wrap">
        <q-card
          class="col shadow-0 no-border-radius background-grey"
          :bordered="false"
        >
          <q-linear-progress
            v-if="pageSetttingsLoading"
            indeterminate
            size="xs"
            color="primary"
          />
          <template v-if="!pageSetttingsLoading">
            <div v-if="isCustomizing" class="row justify-center q-py-sm">
              <q-list bordered padding class="border-accent">
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Сохраняемые параметры:</q-item-label>
                    <q-item-label caption>
                      <q-item-section>{{
                        l
                          .map(cardsStateOptions, (option) =>
                            l.lowerCase(option.label)
                          )
                          .join(", ")
                      }}</q-item-section>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <draggable
              v-model="cardsState.order"
              @start="onDragStart()"
              @end="onDragEnd()"
              handle=".drag-handle"
              item-key="id"
              class="row q-pa-sm q-gutter-md"
              :disabled="!isCustomizing"
            >
              <template #item="{ element }">
                <div
                  v-if="
                    cardsState.visibilityState[l.lowerFirst(element)] ===
                      'shown' || isCustomizing
                  "
                  :class="{
                    'inactive-item':
                      cardsState.visibilityState[l.lowerFirst(element)] ===
                      'hidden',
                  }"
                >
                  <KeepAlive>
                    <component
                      :is="findedCard(element).component"
                      v-bind="findedCard(element).props"
                      v-on="findedCard(element).on"
                      :key="element"
                    >
                      <template v-if="isCustomizing" #card-controls>
                        <div
                          class="row items-center background-grey bordered q-pa-xs"
                        >
                          <CardHandleAndVisibility
                            v-model="
                              cardsState.visibilityState[l.lowerFirst(element)]
                            "
                          />
                        </div>
                      </template>
                    </component>
                  </KeepAlive>
                </div>
              </template>
            </draggable>

            <!-- <component
              v-for="(card, index) in cards"
              :key="index"
              :is="card.component"
              v-bind="card.props"
              v-on="card.on"
            /> -->
          </template>
        </q-card>

        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <div class="row items-center q-gutter-md">
            <CardsViewCustomizerFab
              :is-any-card-hidden="isAnyCardHidden"
              :is-cards-state-changed="isDefaultCardsStateChanged"
              :is-initial-cards-state-changed="isInitialCardsStateChanged"
              v-model="isCustomizing"
              @open-dialog="isDialogWhatWillBeChoosenToSaveOpen = true"
              @reset="resetCardsState"
            />

            <CardsExpandButton
              v-if="allCardExpandState != 'all-nothing-to-show'"
              :all-card-expand-state="allCardExpandState"
              @change-expand="changeCardExpandStateForAll()"
            />
          </div>
        </q-page-sticky>
      </q-page>
    </PageTemplate>

    <CardsSettingsToSaveDialog
      v-model:isDialogOpen="isDialogWhatWillBeChoosenToSaveOpen"
      v-model:options="cardsStateOptions"
      @save="saveSelectedCardsStateAndNotify"
    />
  </VueThemer>
</template>

<style scoped lang="scss">
.drag-handle {
  cursor: grab;
}

.inactive-item {
  opacity: 0.5;
}

.bordered {
  border: 1px dotted !important;
  border-color: $grey !important;
}

.border-accent {
  border: 1px solid $accent !important;
}
</style>

<route lang="json">
{
  "props": "(route) => route.query"
}
</route>

<script setup lang="ts">
import { ref, computed, watch, provide } from "vue"
import { useRouter } from "vue-router"
import { useQuasar, Dialog, Notify } from "quasar"

import l from "lodash"
import draggable from "vuedraggable"

import PageTemplate from "pages/components/PageTemplate.vue"
import MobilePager from "./components/MobilePager.vue"

import CardHandleAndVisibility from "src/pages/components/DashBoard/components/CardControls/CardHandleAndVisibility/CardHandleAndVisibility.vue"
import CardsViewCustomizerFab from "src/pages/components/DashBoard/components/CardControls/CardsViewCustomizerFab/CardsViewCustomizerFab.vue"
import CardsExpandButton from "src/pages/components/DashBoard/components/CardControls/CardsExpandButton/CardsExpandButton.vue"
import CardsSettingsToSaveDialog from "src/pages/components/DashBoard/components/CardsSettingsToSaveDialog/CardsSettingsToSaveDialog.vue"

import {
  useCardsState,
  defaultCardsState,
} from "src/pages/components/DashBoard/composables/useCardsState"
import { useSettings } from "src/composables/useSettings"
import { useCardsConfig } from "./components/DashBoard/composables/useCardsConfig"
import { useCardsStateOptions } from "./components/DashBoard/composables/useCardsStateOptions"

import { getTitle } from "src/composables/useLinksCategoriesAndGetItByRouter"
import { transformQuery } from "./components/DashBoard/utils/indexPageUtils"

import type {
  CardsState,
  IsCardEmpty,
} from "src/pages/components/DashBoard/types"

const props = defineProps<{
  salesDebtStatuses?: string
  salesPendingStatuses?: string
  salesPendingDaysFromNow?: string
  salesShortageStatuses?: string
  saleItemShortageStatuses?: string
  productShortageStatuses?: string
  productShortageDaysFromNow?: string
  salesShortageDaysFromNow?: string
  salesShortageDaysToShift?: string
  salesNotConfirmedStatuses?: string
  saleItemPendingStatuses?: string
  saleItemsDeliveredDaysFromNow?: string
  saleItemsDeliveredProductIds?: string
  saleItemsDeliveredText?: string
}>()

export type DashboardPageProps = typeof props

const $q = useQuasar()
const router = useRouter()

const currentPageKey = computed(() => router.currentRoute.value.path)

const { getPageSettings, savePageSettings } = useSettings()

const { settings: pageSettings, loading: pageSettingsLoading } =
  getPageSettings(currentPageKey.value)

type PossibleTypesForAutoTransform = number | string | string[] | number[]

const goToQuery = (
  newValue: PossibleTypesForAutoTransform | null | Partial<DashboardPageProps>,
  target: keyof DashboardPageProps | "replaceQuery"
) => {
  return router.push({
    name: "/",
    query: transformQuery(props, newValue, target),
  })
}

const activeQuery = computed(() => l.pickBy(props, (val) => !!val))

const isCardEmpty = ref<IsCardEmpty>({
  productsShortageCard: true,
  salesShortageCard: true,
  salesPendingCard: true,
  salesDebtCard: true,
  salesNotConfirmedCard: true,
  suppliesNotConfirmedCard: true,
  relocationsNotConfirmedCard: true,
  assembliesNotConfirmedCard: true,
  disassembliesNotConfirmedCard: true,
})

const initialCardsState = computed<CardsState>(() =>
  l.merge(l.cloneDeep(defaultCardsState), pageSettings.value)
)
const cardsState = ref<CardsState>(l.cloneDeep(defaultCardsState))

const {
  isDefaultCardsStateChanged,
  isInitialCardsStateChanged,
  isAnyCardHidden,
  allCardExpandState,
  updateCardsStateWithKeys,
  changeCardExpandStateForAll,
} = useCardsState({ cardsState, initialCardsState, isCardEmpty })

const { cardsStateOptions, activeCardsStateOptions } = useCardsStateOptions({
  cardsState,
  initialCardsState,
})

watch(
  () => initialCardsState.value,
  async (initialWithLoadedSettings) => {
    // cardsState should match initialCardsState, except for the query, which should match activeQuery.
    cardsState.value = l.merge(
      l.cloneDeep(initialWithLoadedSettings),
      !l.isEmpty(activeQuery.value) ? { query: activeQuery.value } : {}
    )

    // Only If activeQuery is empty and the query in pageSettings is not empty, use the query from pageSettings.
    if (
      !l.isEmpty(initialWithLoadedSettings.query) &&
      l.isEmpty(activeQuery.value)
    ) {
      await goToQuery(initialWithLoadedSettings?.query, "replaceQuery")
      return
    }
  },
  // No state updates are required when initialCardsState changes after initialization.
  { once: true }
)

watch(
  () => [router.currentRoute.value.query, pageSettings.value.query],
  async () => {
    // If the user clicks on the menu to navigate to the main page, attempt to open the query from the settings.
    if (
      l.has(router.currentRoute.value.query, "fromMenu") &&
      !l.isEmpty(pageSettings.value.query)
    )
      await goToQuery(l.get(pageSettings.value, "query"), "replaceQuery")
  },
  { immediate: true, deep: true }
)

watch(
  () => activeQuery.value,
  (newValue) => {
    if (!cardsState.value) return
    //cardsState.query should be equal to activeQuery
    cardsState.value.query = l.cloneDeep(newValue)
  },
  { immediate: true, deep: true }
)

const isDialogWhatWillBeChoosenToSaveOpen = ref(false)

async function updateCardsStateAndSaveChanges(keys: string[]) {
  updateCardsStateWithKeys(keys)

  await savePageSettings(
    currentPageKey.value,
    !l.isEmpty(keys)
      ? l.merge(pageSettings.value, l.pick(cardsState.value, keys))
      : null
  )

  if (l.isEmpty(cardsState.value?.query) && !l.includes(keys, "query")) {
    await goToQuery({}, "replaceQuery")
  }
}

const saveSelectedCardsStateNotifyAndEndCustomizing = async (
  keys: string[]
) => {
  const getMessage = () => {
    if (l.isEmpty(keys) && l.isEmpty(pageSettings.value)) {
      return "Настройки карточек сброшены"
    }

    if (l.isEmpty(keys) && !l.isEmpty(pageSettings.value)) {
      return "Настройки карточек удалены и сброшены на первоначальные"
    }

    return "Настройки карточек сохранены"
  }

  await updateCardsStateAndSaveChanges(keys)
    .then(() => {
      Notify.create({
        type: "positive",
        message: getMessage(),
      })

      isCustomizing.value = false
    })
    .catch(() => {
      Notify.create({
        type: "negative",
        message: `${
          !l.isEmpty(keys)
            ? "Не удалось сохранить настройки карточек"
            : "Не удалось сбросить настройки карточек"
        }`,
      })
    })
}

const resetCardsState = () => {
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
    void saveSelectedCardsStateNotifyAndEndCustomizing([])
  })
}

const isCustomizing = ref(false)
// Provide cardsState for child component DashboardCard.
provide("customization-state", isCustomizing)

const cards = computed(() =>
  useCardsConfig({ props, cardsState, isCardEmpty, goToQuery })
)

const findCard = (id: string) => l.find(cards.value, { id })
const isCardVisible = (element: string) =>
  cardsState.value.visibilityState[l.lowerFirst(element)] === "shown"

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
          <template #navbar-content>
            {{ getTitle(router) }}
          </template>

          <q-page padding class="column background-grey q-gutter-y-md">
            <q-linear-progress
              v-if="pageSettingsLoading"
              indeterminate
              size="xs"
              color="primary"
            />

            <template v-if="!pageSettingsLoading">
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
                handle=".drag-handle"
                item-key="id"
                class="column q-gutter-md"
                :disabled="!isCustomizing"
              >
                <template #item="{ element }">
                  <div
                    v-if="isCardVisible(element) || isCustomizing"
                    :class="{
                      'inactive-item': !isCardVisible(element),
                    }"
                  >
                    <KeepAlive>
                      <component
                        :is="findCard(element).component"
                        v-bind="{
                          ...findCard(element).props,
                          mobile: true,
                        }"
                        v-on="findCard(element).on"
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
      <q-page class="row no-wrap">
        <q-card
          class="col shadow-0 no-border-radius background-grey"
          :bordered="false"
        >
          <q-linear-progress
            v-if="pageSettingsLoading"
            indeterminate
            size="xs"
            color="primary"
          />

          <template v-if="!pageSettingsLoading">
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
              handle=".drag-handle"
              item-key="id"
              class="row q-pa-sm q-gutter-md"
              :disabled="!isCustomizing"
            >
              <template #item="{ element }">
                <div
                  v-if="isCardVisible(element) || isCustomizing"
                  :class="{
                    'inactive-item': !isCardVisible(element),
                  }"
                >
                  <KeepAlive>
                    <component
                      :is="findCard(element).component"
                      v-bind="findCard(element).props"
                      v-on="findCard(element).on"
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
              :is-initial-cards-state-changed="
                !l.isEmpty(activeCardsStateOptions)
              "
              :is-any-card-hidden="isAnyCardHidden"
              :is-cards-state-changed="isDefaultCardsStateChanged"
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
      :options="activeCardsStateOptions"
      v-model:isDialogOpen="isDialogWhatWillBeChoosenToSaveOpen"
      @choosen-keys="saveSelectedCardsStateNotifyAndEndCustomizing"
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

import { computed } from 'vue'
import l from 'lodash'

import { defaultCardsOrder } from 'src/pages/components/DashBoard/const'
import { initialCardsStateOptions } from 'src/pages/components/DashBoard/composables/useCardsStateOptions'

import type { Ref } from 'vue'
import type {
  CardsState,
  IsCardEmpty,
} from 'src/pages/components/DashBoard/types'

const defaultCardsState: CardsState = {
  expandState: {
    productsShortageCard: 'collapsed',
    salesShortageCard: 'collapsed',
    salesPendingCard: 'collapsed',
    salesDebtCard: 'collapsed',
    salesNotConfirmedCard: 'collapsed',
    suppliesNotConfirmedCard: 'collapsed',
    relocationsNotConfirmedCard: 'collapsed',
    assembliesNotConfirmedCard: 'collapsed',
    disassembliesNotConfirmedCard: 'collapsed',
  },
  visibilityState: {
    productsShortageCard: 'shown',
    salesShortageCard: 'shown',
    salesPendingCard: 'shown',
    salesDebtCard: 'shown',
    salesNotConfirmedCard: 'shown',
    suppliesNotConfirmedCard: 'shown',
    relocationsNotConfirmedCard: 'shown',
    assembliesNotConfirmedCard: 'shown',
    disassembliesNotConfirmedCard: 'shown',
    saleItemsDeliveredCard: 'shown',
  },
  order: [...defaultCardsOrder],
  query: {},
} as const

function useCardsState({
  cardsState,
  initialCardsState,
  isCardEmpty,
}: {
  cardsState?: Ref<CardsState> | null
  initialCardsState?: Ref<CardsState> | null
  isCardEmpty: Ref<IsCardEmpty>
}) {
  const savableKeys = l.map(initialCardsStateOptions, 'value')

  const isDefaultCardsStateChanged = computed(() => {
    return !l.isEqual(
      l.pick(defaultCardsState, savableKeys),
      l.pick(cardsState.value, savableKeys),
    )
  })

  const isInitialCardsStateChanged = computed(() => {
    return !l.isEqual(
      l.pick(initialCardsState.value, savableKeys),
      l.pick(cardsState.value, savableKeys),
    )
  })

  const isAnyCardHidden = computed(() =>
    l.some(cardsState.value.visibilityState, (status) => status === 'hidden'),
  )

  const allCardExpandState = computed(() => {
    if (l.every(isCardEmpty.value, (state) => state))
      return 'all-nothing-to-show'

    const validKeys = l.intersection(
      l.keys(isCardEmpty.value),
      l.keys(cardsState.value.expandState),
    )

    const isNotEmptiedKeys = l.filter(
      validKeys,
      (key) => !isCardEmpty.value[key],
    )

    const cardsStateExpandStateToCheck = l.pick(
      cardsState.value.expandState,
      isNotEmptiedKeys,
    )

    if (
      l.every(cardsStateExpandStateToCheck, (status) => status === 'expanded')
    )
      return 'all-possible-expanded'

    return 'expandable'
  })

  function changeCardExpandStateForAll() {
    const getNewValue = () => {
      if (allCardExpandState.value === 'all-possible-expanded')
        return 'collapsed'
      if (allCardExpandState.value === 'expandable') return 'expanded'
      if (allCardExpandState.value === 'all-nothing-to-show') return undefined
    }
    const newValue = getNewValue()

    if (newValue) {
      l.forEach(cardsState.value.expandState, (val, key) => {
        // Only update non-empty cards
        if (!isCardEmpty.value[key]) {
          cardsState.value.expandState[key] = newValue
        }
      })
    }
  }

  function updateCardsStateWithKeys(keys: string[]) {
    if (l.isEmpty(keys)) cardsState.value = l.cloneDeep(defaultCardsState)
    else {
      const newState = l.pick(cardsState.value, keys)
      cardsState.value = l.merge(l.cloneDeep(initialCardsState.value), newState)
    }
  }

  return {
    isDefaultCardsStateChanged,
    isInitialCardsStateChanged,
    isAnyCardHidden,
    allCardExpandState,
    changeCardExpandStateForAll,
    updateCardsStateWithKeys,
  }
}

type AllCardExpandState = ReturnType<
  typeof useCardsState
>['allCardExpandState']['value']

export { useCardsState, defaultCardsState }

export type { AllCardExpandState }

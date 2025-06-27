import l from 'lodash'
import { ref, computed, watchEffect } from 'vue'
import type { Ref } from 'vue'
import type { CardsState } from 'src/pages/components/DashBoard/types'

const initialCardsStateOptions = [
  {
    value: 'expandState',
    label: 'Раскрытые',
    status: 'active' as Status,
  },
  {
    value: 'visibilityState',
    label: 'Показываемые',
    status: 'active' as Status,
  },
  { value: 'order', label: 'Порядок', status: 'active' as Status },
  { value: 'query', label: 'Выбранные фильтры', status: 'active' as Status },
]
type CardsStateOption = (typeof initialCardsStateOptions)[number]

type Status = 'active' | 'inactive' | 'unchanged'

function useCardsStateOptions({
  cardsState,
  initialCardsState,
}: {
  cardsState?: Ref<CardsState> | null
  initialCardsState?: Ref<CardsState> | null
}) {
  const cardsStateOptions = ref([...initialCardsStateOptions])

  const isStateValueChanged = (value: string) => {
    return !l.isEqual(
      l.get(cardsState.value, value),
      l.get(initialCardsState.value, value),
    )
  }

  watchEffect(() =>
    l.forEach(cardsStateOptions.value, (option) => {
      option.status = isStateValueChanged(option.value) ? 'active' : 'unchanged'
    }),
  )

  const activeCardsStateOptions = computed(() =>
    l.filter(cardsStateOptions.value, (option) =>
      isStateValueChanged(option.value),
    ),
  )

  //   const selectedCardsStateToSave = computed(() => {
  //     const activeKeys = l.map(
  //       l.filter(cardsStateOptions.value, { status: 'active' }),
  //       'value',
  //     )
  //     return l.pick(cardsState.value, activeKeys)
  //   })

  //   const unselectedCardsStateInInitial = computed(() => {
  //     const inactiveKeys = l.map(
  //       l.filter(cardsStateOptions.value, (option) => option.status !== 'active'),
  //       'value',
  //     )

  //     return l.pick(initialCardsState.value, inactiveKeys)
  //   })

  //   function updateCardsStateWithUnselected() {
  //     cardsState.value = l.merge(
  //       l.cloneDeep(cardsState.value),
  //       unselectedCardsStateInInitial.value,
  //     )
  //   }

  return {
    cardsStateOptions,
    activeCardsStateOptions,
  }
}

export { useCardsStateOptions, initialCardsStateOptions }
export type { CardsStateOption }

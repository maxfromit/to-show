import type { defaultCardsOrder } from 'src/pages/components/DashBoard/const'
import type { DashboardPageProps } from 'src/pages/index.vue'
type ExpandStates = ['expanded', 'collapsed']

export type ExpandState = ExpandStates[number]

export type VisibilityState = 'shown' | 'hidden'

export type CardName = (typeof defaultCardsOrder)[number]
type LowerFirst<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S

export type CardNamesLowerFirst = LowerFirst<CardName>

export type CardsState = {
  expandState: Record<
    Exclude<CardNamesLowerFirst, 'saleItemsDeliveredCard'>,
    ExpandState
  >
  visibilityState: Record<CardNamesLowerFirst, VisibilityState>
  order: CardName[]
  query: Partial<DashboardPageProps>
}

export type IsCardEmpty = Record<
  Exclude<CardNamesLowerFirst, 'saleItemsDeliveredCard'>,
  boolean
>

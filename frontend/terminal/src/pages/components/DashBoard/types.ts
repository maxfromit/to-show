import type { defaultCardsOrder } from 'src/pages/components/DashBoard/const'

type ExpandStates = ['nothing-to-show', 'expanded', 'collapsed']

export type ExpandState = ExpandStates[number]

export type VisibilityState = 'shown' | 'hidden'

export type CardName = (typeof defaultCardsOrder)[number]
type LowerFirst<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : S

export type CardNamesLowerFirst = LowerFirst<CardName>

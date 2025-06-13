export const initialCardsStateOptions = [
  {
    value: 'visibilityState',
    label: 'Показываемые / скрытые',
    status: 'active' as Status,
  },
  { value: 'order', label: 'Порядок', status: 'active' as Status },
  { value: 'query', label: 'Выбранные фильтры', status: 'active' as Status },
]

type Status = 'active' | 'inactive' | 'unchanged'
export type CardsStateOption = (typeof initialCardsStateOptions)[number]

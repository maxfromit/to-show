import { getDateNow, getUTC0TimeDayEnd } from 'src/utils/dateCalculation'

export const whereNotConfirmedRelocationItems = {
  product_moves: {
    confirmed_at: { _is_null: true },
    deactivated_at: { _is_null: true },
    count: { _gt: '0' },
    planned_at: { _lte: getUTC0TimeDayEnd(getDateNow()) },
  },
}

export const whereNotConfirmedRelocation = {
  relocation_items: whereNotConfirmedRelocationItems,
}

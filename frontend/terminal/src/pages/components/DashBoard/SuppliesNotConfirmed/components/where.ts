import { getDateNow, getUTC0TimeDayEnd } from 'src/utils/dateCalculation'

export const whereNotConfirmedSupplyItems = {
  product_moves: {
    confirmed_at: { _is_null: true },
    deactivated_at: { _is_null: true },
  },
  planned_at: { _lte: getUTC0TimeDayEnd(getDateNow()) },
}

export const whereNotConfirmedSupply = {
  supplier_id: { _is_null: false },
  supply_items: whereNotConfirmedSupplyItems,
}

import { getDateNow, getUTC0TimeDayEnd } from 'src/utils/dateCalculation'

export const whereNotConfirmedDisassemblyItems = {
  product_moves: {
    confirmed_at: { _is_null: true },
    deactivated_at: { _is_null: true },
    count: { _gte: '0' },
  },
  planned_at: { _lte: getUTC0TimeDayEnd(getDateNow()) },
}

export const whereNotConfirmedDisassembly = {
  disassembly_items: whereNotConfirmedDisassemblyItems,
}

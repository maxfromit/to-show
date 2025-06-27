import { getDateNow, getUTC0TimeDayEnd } from 'src/utils/dateCalculation'
import { inactiveSaleStatuses } from 'src/utils/handleSaleStatus'
import l from 'lodash'

export const whereNotConfirmedSaleItems = {
  deadline: { _lte: getUTC0TimeDayEnd(getDateNow()) },
  _or: [
    {
      product_moves: {
        confirmed_at: { _is_null: true },
        deactivated_at: { _is_null: true },
      },
    },
  ],
}

export function useWhere(saleStatuses?: string[]) {
  return {
    ...(!!saleStatuses && !l.isEmpty(saleStatuses)
      ? { status: { _in: saleStatuses } }
      : {
          status: {
            _nin: inactiveSaleStatuses.map((status) => status.value),
          },
        }),
    sale_items: whereNotConfirmedSaleItems,
  }
}

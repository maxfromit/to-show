import { computed } from 'vue'
import { getDateEndByDaysFromNow } from 'src/utils/dateCalculation'
import { getUTC0TimeDayEnd, getTimeNow } from 'src/utils/dateCalculation'

import l from 'lodash'
import { excludedStatuses } from './excludedSaleAndSaleItemStatuses'
import {
  inactiveSaleStatusesStringArray,
  activeSaleStatuses,
} from 'src/utils/handleSaleStatus'

export function useWherePendingSaleItemsWithDeadline({
  daysFromNow,
}: {
  daysFromNow?: number
}) {
  return {
    ...(l.isNumber(daysFromNow)
      ? {
          deadline: {
            _lte: getUTC0TimeDayEnd(
              getTimeNow().add(daysFromNow, 'day').format('YYYY-MM-DD'),
            ),
          },
        }
      : {}),

    sale_item_shipping_state: {
      status: {
        _nin: excludedStatuses,
      },
    },
  }
}

export function useWherePendingSale({
  saleStatuses,
  saleItemStatuses,
  daysFromNow,
}: {
  saleStatuses?: string[]
  saleItemStatuses?: string[]
  daysFromNow?: number
}) {
  return {
    ...(!l.isEmpty(saleStatuses)
      ? { status: { _in: saleStatuses } }
      : {
          status: {
            _in: activeSaleStatuses.map((status) => status.value),
          },
        }),

    ...(!l.isEmpty(saleItemStatuses)
      ? {
          sale_shipping_state: {
            status: {
              _in: saleItemStatuses,
            },
          },
        }
      : {
          sale_shipping_state: {
            status: {
              _nin: l.concat(excludedStatuses, inactiveSaleStatusesStringArray),
            },
          },
        }),

    sale_items: useWherePendingSaleItemsWithDeadline({
      daysFromNow: daysFromNow,
      // saleItemStatuses: saleItemStatuses,
    }),
  }
}

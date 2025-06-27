import l from 'lodash'
import { saleItemShortageStatusDetails } from 'src/pages/components/DashBoard/SalesShortage/components/saleItemShortageStatusDetails'
import { inactiveSaleStatusesStringArray } from 'src/utils/handleSaleStatus'
import { pendingSaleItemStatuses } from 'src/utils/pendingSaleItemStatuses'
import { getDateEndByDaysFromNow } from 'src/utils/dateCalculation'

export function whereAvailabilitySaleItemsWithDeadline({
  saleStatuses,
  daysFromNow,
}: {
  saleStatuses?: string[]
  daysFromNow?: number
}) {
  return {
    ...(l.isNumber(daysFromNow)
      ? {
          deadline: {
            _lte: getDateEndByDaysFromNow(daysFromNow),
          },
        }
      : {}),
    sale_item_shipping_state: {
      status: { _in: pendingSaleItemStatuses },
    },
    sale: {
      ...(!l.isEmpty(saleStatuses)
        ? { status: { _in: saleStatuses } }
        : {
            status: {
              _nin: inactiveSaleStatusesStringArray,
            },
          }),
    },
  }
}

export function whereAvailabilitySaleItems(statuses?: string[]) {
  const allStatuses = saleItemShortageStatusDetails.map(
    (detail) => detail.statusResult,
  )

  if (!statuses || l.isEmpty(statuses)) {
    return {
      _or: allStatuses.map((status) => ({ [status]: { _lt: '0' } })),
    }
  }

  if (statuses.length === 1) {
    const status = statuses[0]
    return { [status]: { _lt: '0' } }
  }

  const orConditions = statuses.map((status) => ({ [status]: { _lt: '0' } }))

  return {
    _or: orConditions,
  }
}

import l from 'lodash'
import { getUTC0TimeDayStart, getTimeNow } from 'src/utils/dateCalculation'

export function whereProductMovesSaleItemsDeliveredForDays(
  daysFromNow?: number,
) {
  return {
    ...(l.isNumber(daysFromNow)
      ? {
          confirmed_at: {
            _gte: getUTC0TimeDayStart(
              getTimeNow().add(daysFromNow, 'day').format('YYYY-MM-DD'),
            ),
          },
        }
      : {}),
    deactivated_at: { _is_null: true },
    sale_item_id: { _is_null: false },
  }
}

export function whereProductWithMoves({
  productIds,
  text,
  daysFromNow,
}: {
  productIds?: number[]
  text?: string
  daysFromNow?: number
}) {
  const textTokens = text ? l.trim(text).split(' ') : null
  const textRegEx = l.uniq(textTokens).join('|')

  return {
    ...(!l.isEmpty(text)
      ? {
          _or: [
            { name: { _iregex: textRegEx } },
            { sku: { _iregex: textRegEx } },
          ],
        }
      : {}),
    ...(!!productIds && !l.isEmpty(productIds)
      ? { id: { _in: productIds } }
      : {}),
    product_moves: whereProductMovesSaleItemsDeliveredForDays(daysFromNow),
  }
}

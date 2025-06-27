import l from 'lodash'
import dayjs from 'dayjs'
import type { RelocationsNotConfirmed_RelocationItemFragment } from 'src/gql/graphql'

type RelocationItem = RelocationsNotConfirmed_RelocationItemFragment

export const sortedRelocationItemsByPlannedAt = (
  relocationItems: RelocationItem[],
) => {
  const itemWithPlannedAtWithMoves = l.map(relocationItems, (item) => {
    const { planned_at, product, product_id } =
      l
        .chain(item.product_moves)
        .filter((move) => move.count > 0)
        .first()
        .value() || {}

    return {
      id: item.id,
      product_id: product_id,
      planned_at: planned_at,
      product: product,
      product_moves: l.filter(item.product_moves, (move) => move.count > 0),
    }
  })
  // Sort the items by planned_at
  const sortedItems = l.orderBy(
    itemWithPlannedAtWithMoves,
    [
      (item) => dayjs(item?.planned_at).valueOf(),
      (item) => item?.product?.bundle_id,
    ],
    ['asc', 'asc'],
  )

  return sortedItems
}

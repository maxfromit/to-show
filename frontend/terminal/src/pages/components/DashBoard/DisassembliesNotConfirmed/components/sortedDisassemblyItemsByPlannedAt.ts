import l from 'lodash'
import dayjs from 'dayjs'
import type { DisassembliesNotConfirmed_DisassemblyItemFragment } from 'src/gql/graphql'

type DisassemblyItem = DisassembliesNotConfirmed_DisassemblyItemFragment

export const sortedDisassemblyItemsByPlannedAt = (
  disassemblyItems: DisassemblyItem[],
) => {
  const itemWithPlannedAtWithMoves = l.map(disassemblyItems, (item) => {
    return {
      id: item.id,
      product_id: item.bundle?.product?.id,
      planned_at: item?.planned_at,
      product: item?.bundle?.product,
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

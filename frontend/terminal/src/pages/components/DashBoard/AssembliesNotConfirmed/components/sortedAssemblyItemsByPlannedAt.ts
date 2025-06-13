import l from 'lodash'
import dayjs from 'dayjs'
import type { AssembliesNotConfirmed_AssemblyItemFragment } from 'src/gql/graphql'

type AssemblyItem = AssembliesNotConfirmed_AssemblyItemFragment

export const sortedAssemblyItemsByPlannedAt = (
  assemblyItems: AssemblyItem[],
) => {
  const itemWithPlannedAtWithMoves = l.map(assemblyItems, (item) => {
    return {
      id: item.id,
      product_id: item?.bundle?.product?.id,
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

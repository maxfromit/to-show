import l from 'lodash'
import dayjs from 'dayjs'
import type { SuppliesNotConfirmed_SupplyItemFragment } from 'src/gql/graphql'

type SupplyItem = SuppliesNotConfirmed_SupplyItemFragment

export const sortedSupplyItemsByPlannedAt = (supplyItems: SupplyItem[]) => {
  // Sort the items by planned_at
  const sortedItems = l.orderBy(
    supplyItems,
    [
      (item) => dayjs(item?.planned_at).valueOf(),
      (item) => item?.product?.bundle_id,
    ],
    ['asc', 'asc'],
  )

  return sortedItems
}

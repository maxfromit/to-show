import l from 'lodash'
import dayjs from 'dayjs'
import type { SalesPending_SaleItemFragment } from 'src/gql/graphql'

type SaleItem = SalesPending_SaleItemFragment

export const sortedSaleItemsByDeadline = (saleItems: SaleItem[]) => {
  // Sort the items by deadline
  const sortedItems = l.orderBy(
    saleItems,
    [
      (item) => dayjs(item?.deadline).valueOf(),
      (item) => item?.product?.bundle_id,
    ],
    ['asc', 'asc'],
  )

  return sortedItems
}

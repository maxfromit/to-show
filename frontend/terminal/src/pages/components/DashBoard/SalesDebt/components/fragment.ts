import gql from 'graphql-tag'
import { fragmentSaleBasic } from 'src/constants/fragments'

export const fragmentSaleDebtSummary = gql`
  fragment SalesDebtTable_SaleDebtSummaryFragment on sale {
    sale_debt_summary {
      bundles_count
      bundle_items_count
      total_bundle_items_quantity
    }
  }
`

export const fragmentSaleAggregate = gql`
  fragment SalesDebtTable_SaleAggregateFragment on sale_aggregate {
    aggregate {
      count
    }
  }
`

const fragmentSaleDebtSaleItems = gql`
  fragment SalesDebtTable_SaleDebtSaleItems on sale_item {
    id
    price
    count
    sale_id
    deadline
    product_id
    product {
      id
      name
      sku
      bundle_id
    }
    id
    debts(
      where: {
        sale_item_shipping_state: {
          status: { _nin: ["extra", "all-executed"] }
        }
      }
    ) {
      id
      price
      count
      sale_id
      deadline
      product_id
      product {
        id
        name
        sku
        bundle_id
      }
    }
  }
`

export const fragmentSaleWithSaleDebt = gql`
  fragment SalesDebtTable_SalesWithSaleDebtSummaryFragment on sale {
    ...MainFragments_SaleFragment
    ...SalesDebtTable_SaleDebtSummaryFragment
    bundlesWithDebts: sale_items(
      where: {
        debts: {
          sale_item_shipping_state: {
            status: { _nin: ["extra", "all-executed"] }
          }
        }
      }
    ) {
      ...SalesDebtTable_SaleDebtSaleItems
    }
  }
  ${fragmentSaleBasic}
  ${fragmentSaleDebtSummary}
  ${fragmentSaleDebtSaleItems}
`

import gql from 'graphql-tag'

export const fragmentSupplyItem = gql`
  fragment SuppliesNotConfirmed_SupplyItem on supply_item {
    id
    product_id
    product {
      bundle_id
      sku
      name
    }
    planned_at
    product_moves {
      warehouse_id
      warehouse {
        name
      }
    }
  }
`

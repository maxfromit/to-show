import gql from 'graphql-tag'

export const fragmentRelocationItem = gql`
  fragment RelocationsNotConfirmed_RelocationItem on relocation_item {
    id
    product_moves {
      product_id
      product {
        bundle_id
        sku
        name
      }
      count
      planned_at
      confirmed_at
      warehouse_id
      warehouse {
        name
      }
    }
  }
`

import gql from 'graphql-tag'

export const fragmentAssemblyItem = gql`
  fragment AssembliesNotConfirmed_AssemblyItem on assembly_item {
    id
    bundle_id
    bundle {
      product {
        id
        bundle_id
        sku
        name
      }
    }
    planned_at
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

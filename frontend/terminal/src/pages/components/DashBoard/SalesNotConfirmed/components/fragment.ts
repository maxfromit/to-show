import gql from 'graphql-tag'

export const fragmentSaleItem = gql`
  fragment SalesNotConfirmed_SaleItem on sale_item {
    id
    product_id
    product {
      bundle_id
      sku
      name
    }
    deadline
  }
`

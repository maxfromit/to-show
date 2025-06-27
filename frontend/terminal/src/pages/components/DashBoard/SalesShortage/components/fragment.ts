import gql from 'graphql-tag'

export const fragmentSaleItem = gql`
  fragment SalesShortage_SaleItem on sale_item {
    id
    product_id
    product {
      bundle_id
      sku
      name
    }
    deadline
    count
    sale_item_shipping_state {
      status
    }
  }
`

export const fragmentExpectedAvailability = gql`
  fragment ExpectedAvailabilityFragment on sale_item_expected_availability_for_function {
    with_prognosis_value
    with_prognosis_value_with_ready_and_expected_to_assembly
    with_prognosis_value_with_ready_to_assembly
    with_stock_by_date
    evaluation_at
    pending_count_by_date
  }
`

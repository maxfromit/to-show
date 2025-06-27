import AssembliesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/AssembliesNotConfirmedCard/AssembliesNotConfirmedCard.vue"
import DisassembliesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/DisassembliesNotConfirmedCard/DisassembliesNotConfirmedCard.vue"
import ProductsShortageCard from "src/pages/components/DashBoard/components/EntityCards/ProductsShortageCard/ProductsShortageCard.vue"
import RelocationsNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/RelocationsNotConfirmedCard/RelocationsNotConfirmedCard.vue"
import SaleItemsDeliveredCard from "src/pages/components/DashBoard/components/EntityCards/SaleItemsDeliveredCard/SaleItemsDeliveredCard.vue"
import SalesDebtCard from "src/pages/components/DashBoard/components/EntityCards/SalesDebtCard/SalesDebtCard.vue"
import SalesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/SalesNotConfirmedCard/SalesNotConfirmedCard.vue"
import SalesPendingCard from "src/pages/components/DashBoard/components/EntityCards/SalesPendingCard/SalesPendingCard.vue"
import SalesShortageCard from "src/pages/components/DashBoard/components/EntityCards/SalesShortageCard/SalesShortageCard.vue"
import SuppliesNotConfirmedCard from "src/pages/components/DashBoard/components/EntityCards/SuppliesNotConfirmedCard/SuppliesNotConfirmedCard.vue"
import {
  parseStatusesFromProps,
  parseDaysFromProps,
  parseIdsFromProps,
} from "src/pages/components/DashBoard/utils/cardHelpers"

import type { DashboardPageProps } from "src/pages/index.vue"
import type {
  CardsState,
  IsCardEmpty,
  CardNamesLowerFirst,
  ExpandState,
} from "src/pages/components/DashBoard/types"
import type { Ref } from "vue"

function useCardsExpandAndIsEmptyEventHandlers(
  cardsState: Ref<CardsState>,
  isCardEmpty: Ref<IsCardEmpty>,
  cardKey: CardNamesLowerFirst
) {
  return {
    "update:expand-state": (val: ExpandState) => {
      cardsState.value.expandState[cardKey] = val
    },
    "update:is-empty-state": (val: boolean) => {
      isCardEmpty.value[cardKey] = val
    },
  }
}

export const useCardsConfig = ({
  props,
  cardsState,
  isCardEmpty,
  goToQuery,
}: {
  props: DashboardPageProps
  cardsState: Ref<CardsState>
  isCardEmpty: Ref<IsCardEmpty>
  goToQuery
}) => {
  return [
    {
      id: "ProductsShortageCard",
      component: ProductsShortageCard,
      props: {
        daysFromNow: parseDaysFromProps(props.productShortageDaysFromNow),
        expandState: cardsState.value?.expandState?.productsShortageCard,
      },
      on: {
        "update:product-statuses": (val: string[]) =>
          goToQuery(val, "productShortageStatuses"),
        "update:days-from-now": (val: number) =>
          goToQuery(val, "productShortageDaysFromNow"),
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "productsShortageCard"
        ),
      },
    },
    {
      id: "SalesShortageCard",
      component: SalesShortageCard,
      props: {
        saleStatuses: parseStatusesFromProps(props.salesShortageStatuses),
        saleItemStatuses: parseStatusesFromProps(
          props.saleItemShortageStatuses
        ),
        daysFromNow: parseDaysFromProps(props.salesShortageDaysFromNow),
        daysToShift: parseDaysFromProps(props.salesShortageDaysToShift),
        expandState: cardsState.value.expandState.salesShortageCard,
      },
      on: {
        "update:sale-statuses": (val: string[]) =>
          goToQuery(val, "salesShortageStatuses"),
        "update:sale-item-statuses": (val: string[]) =>
          goToQuery(val, "saleItemShortageStatuses"),
        "update:days-from-now": (val: number) =>
          goToQuery(val, "salesShortageDaysFromNow"),
        "update:days-to-shift": (val: number) =>
          goToQuery(val, "salesShortageDaysToShift"),
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "salesShortageCard"
        ),
      },
    },
    {
      id: "SalesPendingCard",
      component: SalesPendingCard,
      props: {
        saleStatuses: parseStatusesFromProps(props.salesPendingStatuses),
        saleItemStatuses: parseStatusesFromProps(props.saleItemPendingStatuses),
        daysFromNow: parseDaysFromProps(props.salesPendingDaysFromNow),
        expandState: cardsState.value.expandState.salesPendingCard,
      },
      on: {
        "update:sale-statuses": (val: string[]) =>
          goToQuery(val, "salesPendingStatuses"),
        "update:sale-item-statuses": (val: string[]) =>
          goToQuery(val, "saleItemPendingStatuses"),
        "update:days-from-now": (val: number) =>
          goToQuery(val, "salesPendingDaysFromNow"),
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "salesPendingCard"
        ),
      },
    },
    {
      id: "SalesDebtCard",
      component: SalesDebtCard,
      props: {
        saleStatuses: parseStatusesFromProps(props.salesDebtStatuses),
        expandState: cardsState.value.expandState.salesDebtCard,
      },
      on: {
        "update:sale-statuses": (val: string[]) =>
          goToQuery(val, "salesDebtStatuses"),
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "salesDebtCard"
        ),
      },
    },
    {
      id: "SalesNotConfirmedCard",
      component: SalesNotConfirmedCard,
      props: {
        saleStatuses: parseStatusesFromProps(props.salesNotConfirmedStatuses),
        expandState: cardsState.value.expandState.salesNotConfirmedCard,
      },
      on: {
        "update:sale-statuses": (val: string[]) =>
          goToQuery(val, "salesNotConfirmedStatuses"),
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "salesNotConfirmedCard"
        ),
      },
    },
    {
      id: "SuppliesNotConfirmedCard",
      component: SuppliesNotConfirmedCard,
      props: {
        expandState: cardsState.value.expandState.suppliesNotConfirmedCard,
      },
      on: {
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "suppliesNotConfirmedCard"
        ),
      },
    },
    {
      id: "RelocationsNotConfirmedCard",
      component: RelocationsNotConfirmedCard,
      props: {
        expandState: cardsState.value.expandState.relocationsNotConfirmedCard,
      },
      on: {
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "relocationsNotConfirmedCard"
        ),
      },
    },
    {
      id: "AssembliesNotConfirmedCard",
      component: AssembliesNotConfirmedCard,
      props: {
        expandState: cardsState.value.expandState.assembliesNotConfirmedCard,
      },
      on: {
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "assembliesNotConfirmedCard"
        ),
      },
    },
    {
      id: "DisassembliesNotConfirmedCard",
      component: DisassembliesNotConfirmedCard,
      props: {
        expandState: cardsState.value.expandState.disassembliesNotConfirmedCard,
      },
      on: {
        ...useCardsExpandAndIsEmptyEventHandlers(
          cardsState,
          isCardEmpty,
          "disassembliesNotConfirmedCard"
        ),
      },
    },
    {
      id: "SaleItemsDeliveredCard",
      component: SaleItemsDeliveredCard,
      props: {
        productIds: parseIdsFromProps(props.saleItemsDeliveredProductIds),
        daysFromNow: parseDaysFromProps(props.saleItemsDeliveredDaysFromNow),
        textFilter: props.saleItemsDeliveredText ?? null,
      },
      on: {
        "update:days-from-now": (val: number) =>
          goToQuery(val, "saleItemsDeliveredDaysFromNow"),

        "update:product-ids": (val: number[]) =>
          goToQuery(val, "saleItemsDeliveredProductIds"),

        "update:text-filter": (val: string | null) =>
          goToQuery(val, "saleItemsDeliveredText"),
      },
    },
  ]
}

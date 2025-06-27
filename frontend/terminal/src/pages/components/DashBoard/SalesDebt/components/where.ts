import { computed } from 'vue'
import l from 'lodash'
import { inactiveSaleStatuses } from 'src/utils/handleSaleStatus'

export function useWhere(saleStatuses?: string[]) {
  return {
    ...(!!saleStatuses && !l.isEmpty(saleStatuses)
      ? { status: { _in: saleStatuses } }
      : {
          status: {
            _nin: inactiveSaleStatuses.map((status) => status.value),
          },
        }),
    sale_debt_summary: { bundles_count: { _gt: '0' } },
  }
}

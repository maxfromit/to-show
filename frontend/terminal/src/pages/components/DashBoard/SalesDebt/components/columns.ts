import type { QTableProps } from 'quasar'
import { labelByEntity } from 'src/constants/labels'
import l from 'lodash'

export const columns = <QTableProps['columns']>[
  {
    name: 'customer:name',
    align: 'left',
    label: l.get(labelByEntity, 'sale.customer_id'),
    field: (row) => l.get(row, 'customer.name'),
    sortable: true,
  },
  {
    name: 'sale_debt_summary:bundles_count',
    align: 'right',
    label: 'Комплектов',
    field: (row) => l.get(row, 'sale_debt_summary.bundles_count'),
    sortable: true,
  },

  {
    name: 'link',
    label: '',
    required: true,
    align: 'right',
  },
]

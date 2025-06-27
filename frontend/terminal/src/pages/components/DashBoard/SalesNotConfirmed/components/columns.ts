import type { QTableProps } from 'quasar'
import { labelByEntity } from 'src/constants/labels'
import l from 'lodash'
import { sortedSaleItemsByDeadline } from './sortSaleItemsByDeadline'
import dayjs from 'dayjs'
import { formatToDDMMYY } from 'src/utils/dateFormatter'

export const columns = <QTableProps['columns']>[
  {
    name: 'customer',
    align: 'left',
    label: l.get(labelByEntity, 'sale.customer_id'),
    field: (row) => l.get(row, 'customer.name'),
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'deadline',
    align: 'right',
    label: l.get(labelByEntity, 'sale_item.deadline'),
    field: (row) =>
      l.first(sortedSaleItemsByDeadline(row?.sale_items))?.deadline,
    format: (val) => formatToDDMMYY(val),
    sortable: true,
    sort: (a, b) => {
      const dateA = dayjs(a)
      const dateB = dayjs(b)
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0
    },
  },

  {
    name: 'link',
    label: '',
    required: true,
    field: 'link',
    align: 'right',
  },
]

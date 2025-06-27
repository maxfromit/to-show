import type { QTableProps } from 'quasar'
import { labelByEntity } from 'src/constants/labels'
import l from 'lodash'
import { sortedRelocationItemsByPlannedAt } from 'src/pages/components/DashBoard/RelocationsNotConfirmed/components/sortedRelocationItemsByPlannedAt'
import dayjs from 'dayjs'
import { formatToDDMMYY } from 'src/utils/dateFormatter'

export const columns = <QTableProps['columns']>[
  {
    name: 'note',
    align: 'left',
    label: l.get(labelByEntity, 'relocation.note'),
    field: (row) => l.get(row, 'note'),
    format: (val) => `${val}`,
    sortable: true,
    style: 'min-width: 8rem',
  },
  {
    name: 'planned_at',
    align: 'right',
    label: l.get(labelByEntity, 'relocation_item.planned_in_at'),
    field: (row) =>
      l.first(sortedRelocationItemsByPlannedAt(row?.relocation_items))
        ?.planned_at,
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

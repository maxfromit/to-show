import type { QTableProps } from 'quasar'

export const columns = <QTableProps['columns']>[
  {
    name: 'product',
    align: 'left',
    label: 'Позиция',
    field: (row) => `${row?.sku} – ${row?.name}`,
    format: (val) => `${val}`,
    sortable: true,
  },

  {
    name: 'count',
    align: 'right',
    label: 'шт.',
    field: (row) => row?.count,
    format: (val) => `${val}`,
    sortable: true,
    headerStyle: 'width: 5rem',
    style: 'width: 5rem',
  },

  // {
  //   name: 'link',
  //   label: '',
  //   required: true,
  //   field: 'link',
  //   align: 'right',
  // },
]

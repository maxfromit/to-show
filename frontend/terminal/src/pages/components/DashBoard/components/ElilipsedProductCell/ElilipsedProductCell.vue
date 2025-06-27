<script setup lang="ts">
import type { QTableColumn, QTableSlots } from 'quasar'
import { getFormattedValueByColumnName } from 'src/utils/qTableColumnsHandlers/getFormattedValueByColumnName'
import { getJustifyByColumnAligning } from 'src/utils/qTableColumnsHandlers/getJustifyByColumnAligning'

defineProps<{
  cellProps: Parameters<NonNullable<QTableSlots['body-cell']>>[0]
  columns: QTableColumn[]
}>()
</script>

<template>
  <VueThemer>
    <div
      :class="getJustifyByColumnAligning(cellProps.col.align)"
      class="row items-center q-gutter-x-xs no-wrap"
    >
      <div class="ellipsis-2-lines">
        {{
          getFormattedValueByColumnName({
            columns,
            columnName: cellProps.col.name,
            row: cellProps.row,
          })
        }}
        <q-tooltip theme="extra.delayWidth">
          {{
            getFormattedValueByColumnName({
              columns,
              columnName: cellProps.col.name,
              row: cellProps.row,
            })
          }}
        </q-tooltip>
      </div>
    </div>
  </VueThemer>
</template>

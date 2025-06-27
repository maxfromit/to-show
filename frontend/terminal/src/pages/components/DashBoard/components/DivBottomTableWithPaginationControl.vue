<script setup lang="ts">
import { computed } from 'vue'
import l from 'lodash'
import { rowsPerPage } from 'src/pages/components/DashBoard/components/rowsPerPage'
import { rowsPerPageOptions } from 'src/boot/themer'
import type { QTableSlots } from 'quasar'

const props = defineProps<{
  rowsNumber: number
  scope: Parameters<QTableSlots['bottom']>[number]
}>()

const pagination = defineModel('pagination', {
  default: {
    rowsPerPage: rowsPerPage,
    sortBy: 'deadline',
    descending: false,
  },
})

const rowsPerPageOptionOnRowsNumbers = computed(() =>
  props.rowsNumber && props.rowsNumber > rowsPerPageOptions[0]
    ? l.concat(
        l.filter(rowsPerPageOptions, (option) => option <= props.rowsNumber),
        props.rowsNumber,
      )
    : props.rowsNumber
      ? [props.rowsNumber]
      : rowsPerPageOptions,
)
</script>

<template>
  <VueThemer>
    <div class="col-grow row items-center q-gutter-xs justify-end">
      <div class="text-caption">Строк:</div>
      <q-btn-dropdown
        round
        dense
        no-ripple
        auto-close
        cover
        unelevated
        menu-anchor="center middle"
        flat
      >
        <template #label>
          <div class="text-caption">
            {{ props.scope.pagination.rowsPerPage }}
          </div>
        </template>

        <q-list dense>
          <q-item
            v-for="option in rowsPerPageOptionOnRowsNumbers"
            :key="option"
            clickable
            @click="pagination.rowsPerPage = option"
          >
            <q-item-section>{{ option }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <div class="text-caption q-ml-sm">
        {{
          props.scope.pagination.rowsPerPage *
            (props.scope.pagination.page - 1) +
          1
        }}-{{
          props.rowsNumber <=
          props.scope.pagination.rowsPerPage * props.scope.pagination.page
            ? props.rowsNumber
            : props.scope.pagination.rowsPerPage * props.scope.pagination.page
        }}
        из
        {{ props.rowsNumber }}
      </div>

      <q-btn-group
        dense
        flat
      >
        <q-btn
          icon="first_page"
          color="grey-8"
          round
          dense
          flat
          :disable="props.scope.isFirstPage"
          @click="props.scope.firstPage"
        />
        <q-btn
          icon="chevron_left"
          color="grey-8"
          round
          dense
          flat
          :disable="props.scope.isFirstPage"
          @click="props.scope.prevPage"
        />

        <q-btn
          icon="chevron_right"
          color="grey-8"
          round
          dense
          flat
          :disable="props.scope.isLastPage"
          @click="props.scope.nextPage"
        />
        <q-btn
          v-if="props.scope.pagesNumber > 2"
          icon="last_page"
          color="grey-8"
          round
          dense
          flat
          :disable="props.scope.isLastPage"
          @click="props.scope.lastPage"
        />
      </q-btn-group>
    </div>
  </VueThemer>
</template>

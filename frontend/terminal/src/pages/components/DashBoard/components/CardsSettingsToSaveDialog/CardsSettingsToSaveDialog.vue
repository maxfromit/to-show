<script setup lang="ts">
import { computed } from 'vue'
import l from 'lodash'
import { initialCardsStateOptions } from './components/cardsStateOptions'
import type { CardsStateOption } from './components/cardsStateOptions'

const isDialogOpen = defineModel<boolean>('isDialogOpen', { default: false })

const options = defineModel<CardsStateOption[]>('options', {
  default: [...initialCardsStateOptions],
})

const emit = defineEmits<{
  (e: 'save'): void
}>()

const activeOptions = computed(() => {
  return l.filter(options.value, (option) => option.status === 'active')
})
</script>

<template>
  <VueThemer>
    <q-dialog v-model="isDialogOpen">
      <q-card
        class="column"
        style="width: 25rem"
      >
        <q-card-section>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label class="text-h5">
                  Настройки карточек для сохранения
                </q-item-label>
              </q-item-section>
              <q-item-section
                side
                top
              >
                <q-btn
                  icon="close"
                  theme="table.action"
                  v-close-popup
                  padding="none"
                />
              </q-item-section>
            </q-item>

            <template
              v-for="(option, index) in l.filter(
                options,
                (option) => option.status !== 'unchanged',
              )"
              :key="index"
            >
              <q-item
                clickable
                @click="
                  option.status =
                    option.status === 'active' ? 'inactive' : 'active'
                "
                :class="{ 'inactive-item': option.status === 'inactive' }"
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="option.status"
                    true-value="active"
                    false-value="inactive"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ option.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
          <q-item class="row q-gutter-x-xs justify-end">
            <q-btn
              label="Отмена"
              flat
              v-close-popup
              @click="isDialogOpen = false"
            />
            <q-btn
              label="Сохранить настройки"
              @click="emit('save')"
              color="primary"
              v-close-popup
              :disable="l.isEmpty(activeOptions)"
            />
          </q-item>
        </q-card-section>
      </q-card>
    </q-dialog>
  </VueThemer>
</template>

<style scoped lang="scss">
.inactive-item {
  opacity: 0.5;
}
</style>

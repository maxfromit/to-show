<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import l from 'lodash'
import type { CardsStateOption } from 'src/pages/components/DashBoard/composables/useCardsStateOptions'

const props = defineProps<{
  options: CardsStateOption[]
}>()

const isDialogOpen = defineModel<boolean>('isDialogOpen', { default: false })

const emit = defineEmits<{
  (e: 'choosen-keys', keys: string[]): void
}>()

const optionsToChoose = ref<CardsStateOption[]>(l.cloneDeep(props.options))

watch(
  () => props.options,
  (newOptions) => {
    optionsToChoose.value = l.cloneDeep(newOptions)
  },
  { immediate: true, deep: true },
)

// const options = defineModel<CardsStateOption[]>(
//   'options',
//   // , {
//   //   default: [...initialCardsStateOptions],
//   // }
// )

const activeOptionKeys = computed(() => {
  return l
    .chain(optionsToChoose.value)
    .filter((option) => option.status === 'active')
    .map('value')
    .value()
})

function reset() {
  optionsToChoose.value = l.cloneDeep(props.options)
}
</script>

<template>
  <VueThemer>
    <q-dialog
      v-model="isDialogOpen"
      @hide="reset()"
    >
      <q-card
        class="column"
        style="width: 25rem"
      >
        <q-card-section>
          <q-list padding>
            <q-item>
              <q-item-section>
                <q-item-label class="text-h5">
                  Выберите настройки карточек которые будут сохранены
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
              v-for="(option, index) in optionsToChoose"
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
              @click="emit('choosen-keys', activeOptionKeys)"
              color="primary"
              v-close-popup
              :disable="l.isEmpty(activeOptionKeys)"
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

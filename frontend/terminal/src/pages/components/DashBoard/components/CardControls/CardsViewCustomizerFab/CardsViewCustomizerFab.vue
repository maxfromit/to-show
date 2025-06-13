<script setup lang="ts">
defineProps<{
  isAnyCardHidden: boolean
  isCardsStateChanged: boolean
  isInitialCardsStateChanged: boolean
  mobile?: boolean
}>()

const isCustomizing = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'open-dialog'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <VueThemer>
    <div class="relative-position">
      <q-icon
        v-if="isAnyCardHidden"
        name="svguse:/eyes.svg#eye-off"
        color="grey-5"
        class="absolute-top-right z-top"
        style="transform: translate(45%, -45%)"
      >
        <q-tooltip theme="extra.delayShorterWidth">
          Есть скрытые карточки
        </q-tooltip>
      </q-icon>

      <q-fab
        v-model="isCustomizing"
        color="accent"
        type="button"
        :direction="mobile ? 'down' : 'up'"
        :hide-label="isCustomizing"
        icon="svguse:/icons.svg#tuning-4"
        active-icon="svguse:/icons.svg#tuning-4"
        :outline="!isCustomizing"
        external-label
        label-position="top"
        persistent
      >
        <template #tooltip>
          <q-tooltip
            v-if="!isCustomizing"
            theme="extra.delayShorterWidth"
          >
            Включить настройку представления карточек
          </q-tooltip>
        </template>

        <q-fab-action
          v-if="isInitialCardsStateChanged"
          type="button"
          color="primary"
          @click="emit('open-dialog')"
          icon="svguse:/icons.svg#upload"
        >
          <q-tooltip theme="extra.delayShorterWidth">
            Сохранить представление
          </q-tooltip>
        </q-fab-action>

        <q-fab-action
          v-if="isCardsStateChanged"
          :outline="!mobile"
          :flat="!mobile"
          padding="0px 0px"
          type="button"
          color="negative"
          @click="emit('reset')"
          icon="svguse:/icons.svg#close-circle"
        >
          <q-tooltip theme="extra.delayShorterWidth">
            Вернуть первоначальное состояние
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </div>
  </VueThemer>
</template>

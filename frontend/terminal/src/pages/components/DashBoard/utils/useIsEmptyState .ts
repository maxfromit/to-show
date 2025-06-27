import type { ModelRef } from 'vue'

export function useIsEmptyState(isEmpty: ModelRef<boolean>) {
  function setIsEmptyFromCount(count: number | null | undefined) {
    isEmpty.value = !count

    return
  }

  return { setIsEmptyFromCount }
}

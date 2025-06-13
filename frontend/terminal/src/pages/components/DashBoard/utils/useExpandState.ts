import type { ModelRef } from 'vue'
import type { ExpandState } from 'src/pages/components/DashBoard/types'

export function useExpandState(expandState: ModelRef<ExpandState>) {
  function toggleExpand() {
    if (expandState.value === 'nothing-to-show') {
      return
    }
    expandState.value =
      expandState.value !== 'expanded' ? 'expanded' : 'collapsed'
  }

  function expandAndEmit(fEmit: () => void) {
    if (expandState.value !== 'expanded') {
      expandState.value = 'expanded'
    }
    fEmit()
  }

  return { toggleExpand, expandAndEmit }
}

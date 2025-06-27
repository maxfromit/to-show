import type { ModelRef } from 'vue'
import type { ExpandState } from 'src/pages/components/DashBoard/types'

export function useExpandState(expandState: ModelRef<ExpandState>) {
  function toggleExpand() {
    // if (expandState.value === 'nothing-to-show') {
    //   return
    // }
    expandState.value =
      expandState.value === 'collapsed' ? 'expanded' : 'collapsed'

    return
  }

  function expandAndEmit(fEmit: () => void) {
    if (
      expandState.value !== 'expanded'
      // &&
      // expandState.value !== 'nothing-to-show'
    ) {
      expandState.value = 'expanded'
    }
    fEmit()
    return
  }

  return { toggleExpand, expandAndEmit }
}

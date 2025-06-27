import l from 'lodash'
import type { Ref } from 'vue'

import type {
  ExpandState,
  CardNamesLowerFirst,
  CardsState,
  IsCardEmpty,
} from 'src/pages/components/DashBoard/types'

const separator = '~'

function parseStatusesFromProps(statuses: string) {
  return !l.isEmpty(statuses) ? l.split(statuses, separator) : []
}

function parseIdsFromProps(ids: string) {
  return !l.isEmpty(ids)
    ? l.map(l.split(ids, separator), (id) => l.toNumber(id))
    : []
}

function parseDaysFromProps(days: string) {
  return days ? l.toNumber(days) : undefined
}

export {
  parseStatusesFromProps,
  parseIdsFromProps,
  parseDaysFromProps,
  separator,
}

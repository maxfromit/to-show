import l from 'lodash'
import { formatToDDMMYY } from 'src/utils/dateFormatter'
import { getTimeNow, datePickerFormat } from 'src/utils/dateCalculation'

export function getDaysFromNowLabel(days: number, adposition?: string) {
  return l.isNumber(days)
    ? `${adposition ? adposition : 'до'} ${formatToDDMMYY(
        getTimeNow().add(l.toNumber(days), 'day').format(datePickerFormat),
      )}`
    : 'за все время'
}

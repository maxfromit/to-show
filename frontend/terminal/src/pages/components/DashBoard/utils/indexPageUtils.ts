import l from 'lodash'
import type { DashboardPageProps } from 'src/pages/index.vue'
import { transformObjectKeysToKebabCase } from 'src/utils/keysToKebabCase'
import { separator } from 'src/pages/components/DashBoard/utils/cardHelpers'

type PossibleTypesForAutoTransform = number | string | string[] | number[]

function isPossibleTypesForAutoTransform(
  val: unknown,
): val is PossibleTypesForAutoTransform {
  return (
    l.isNumber(val) ||
    l.isString(val) ||
    (l.isArray(val) && l.every(val, (el) => l.isNumber(el) || l.isString(el)))
  )
}

function isValueFilled(val: unknown) {
  return (
    l.isNumber(val) || ((l.isString(val) || l.isArray(val)) && !l.isEmpty(val))
  )
}

function transformValueForQuery(val: PossibleTypesForAutoTransform) {
  if (l.isArray(val)) return l.join(val, separator)
  if (l.isNumber(val) || l.isString(val)) return val
  return ''
}

function transformQuery(
  props: DashboardPageProps,
  newValue: PossibleTypesForAutoTransform | null | Partial<DashboardPageProps>,
  target: keyof DashboardPageProps | 'replaceQuery',
) {
  if (target === 'replaceQuery' && l.isObject(newValue))
    return { ...transformObjectKeysToKebabCase(newValue) }

  if (isValueFilled(newValue) && isPossibleTypesForAutoTransform(newValue))
    return {
      ...l.pickBy(props, (val) => !!val),
      [target]: transformValueForQuery(newValue),
    }
  return {
    ...l.pickBy(l.omit(props, [target]), (val) => !!val),
  }
}

export { transformQuery }

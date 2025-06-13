import { apollo, gql } from './_lib/apollo'
import defaultTriggerNames from './_consts/triggerNames'

// Receives triggerNames, fetches undelivered events, and redelivers each one
async function redeliverUndeliveredEvents(triggerNames?: string[]) {
  // 1. Determine triggers to use
  const triggers =
    Array.isArray(triggerNames) && triggerNames.length > 0
      ? triggerNames
      : defaultTriggerNames

  // 2. Fetch undelivered events via apollo.query
  const { data } = await apollo.query({
    query: gql`
      query GetUndeliveredInvocationLogs($trigger_names: [String!]!) {
        get_undelivered_events(trigger_names: $trigger_names) {
          events {
            id
          }
        }
      }
    `,
    variables: { trigger_names: triggers },
    fetchPolicy: 'no-cache',
  })

  // 3. Collect all event ids
  const events = data?.get_undelivered_events?.events || []

  const undeliveredEventIds = events.map((log: { id: string }) => log.id)
  console.log('Undelivered event IDs:', undeliveredEventIds)
  // 4. Redeliver each event via apollo.mutate

  const results = []
  for (const event_id of undeliveredEventIds) {
    try {
      const mutationResult = await apollo.mutate({
        mutation: gql`
          mutation RedeliverFailedEvent($event_id: uuid!) {
            redeliver_event(event_id: $event_id) {
              message
              success
            }
          }
        `,
        variables: { event_id },
      })
      const result = mutationResult?.data?.redeliver_event || {}
      results.push({
        event_id,
        ...result,
      })
    } catch (error) {
      results.push({
        event_id,
        success: false,
        message: error.message,
      })
    }
  }

  return {
    total: undeliveredEventIds.length,
    results,
  }
}

export default async (req, res) => {
  try {
    const triggerNames = req?.body?.input?.trigger_names ?? []
    const { total, results } = await redeliverUndeliveredEvents(triggerNames)
    res.json({ total, results })
  } catch (error) {
    console.error('Error in redeliver undelivered events:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

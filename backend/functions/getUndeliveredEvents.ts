import fetch from 'cross-fetch'
import defaultTriggerNames from './_consts/triggerNames'

async function fetchUndeliveredEvents(triggerNames?: string[]) {
  const triggers =
    Array.isArray(triggerNames) && triggerNames.length > 0
      ? triggerNames
      : defaultTriggerNames

  const allEvents: any[] = []
  const pageSize = 100

  for (const trigger_name of triggers) {
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const response = await fetch(
        process.env.HASURA_GRAPHQL_GRAPHQL_URL.replace(
          '/v1/graphql',
          '/v1/metadata',
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
          },
          body: JSON.stringify({
            type: 'pg_get_event_logs',
            args: {
              name: trigger_name,
              status: 'processed',
              limit: pageSize,
              offset: offset,
            },
          }),
        },
      )
      const data = await response.json()

      // Filter undelivered events
      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data)
        throw new Error(
          data?.error ? data?.error : 'Failed to fetch event logs',
        )
      }

      // console.log(
      //   `Fetched ${data.length} events for trigger "${trigger_name}" at offset ${offset}`,
      //   data,
      // )
      const undelivered = data.filter(
        (event) => !event?.delivered || !!event?.error,
      )

      console.log(
        `Fetched ${undelivered.length} events for trigger "${trigger_name}" at offset ${offset}`,
        undelivered,
      )
      // Map to required shape
      const mapped = undelivered.map((event) => ({
        id: event?.id,
        schema_name: event?.schema_name,
        table_name: event?.table_name,
        trigger_name: event?.trigger_name,
        payload: event?.payload,
        delivered: event?.delivered,
        error: event?.error,
        tries: event?.tries,
        locked: event?.locked,
        next_retry_at: event?.next_retry_at,
        archived: event?.archived,
        created_at: event?.created_at,
      }))
      allEvents.push(...mapped)

      // If less than pageSize events returned, we've reached the end
      if (data.length < pageSize) {
        hasMore = false
      } else {
        offset += pageSize
      }
    }
  }

  // Return all undelivered logs
  return { total: allEvents.length, events: allEvents }
}

export default async (req, res) => {
  try {
    const triggerNames = req?.body?.input?.trigger_names ?? []
    const { total, events } = await fetchUndeliveredEvents(triggerNames)
    res.json({ success: true, total, events })
  } catch (error) {
    console.error('Error fetching undelivered invocation logs:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

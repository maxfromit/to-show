import { apollo, gql } from './_lib/apollo'
import fetch from 'cross-fetch'

export default async (req, res) => {
  try {
    const eventId = req.body?.input?.event_id
    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: 'event_id is required' })
    }

    // Redeliver the event using Hasura Metadata API
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
          type: 'pg_redeliver_event',
          args: { event_id: eventId },
        }),
      },
    )

    const data = await response.json()
    console.log('Redeliver event response:', data)
    console.log('response:', response)
    console.log('response.ok:', response.ok)

    if (response.ok && !data.error) {
      res.json({
        success: true,
        message:
          'Redelivery requested. Event will be retried by Hasura, but processing outcome is not guaranteed.',
        data,
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to request event redelivery',
        error: data.error || data,
      })
    }
  } catch (error) {
    console.error('Error redelivering event:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

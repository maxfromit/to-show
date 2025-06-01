import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { graphql } from 'src/gql'
import l from 'lodash'
import { hasuraAuthClient } from 'src/lib/auth'

export const userId = computed(() => hasuraAuthClient.getUser()?.id)

export function useSettings() {
  // Save settings for a specific page
  const { mutate: updateUserSetting } = useMutation(
    graphql(/* GraphQL */ `
      mutation useSettings_UpsertUserSetting(
        $user_id: uuid!
        $path: String!
        $json: jsonb!
      ) {
        insert_user_setting_one(
          object: { user_id: $user_id, path: $path, json: $json }
          on_conflict: {
            constraint: user_setting_user_id_path_key
            update_columns: [json]
          }
        ) {
          id
          user_id
          path
          json
        }
      }
    `),
    {
      refetchQueries: 'active',
    },
  )

  function savePageSettings(pageKey: string, state: any) {
    return updateUserSetting({
      user_id: userId.value,
      path: pageKey,
      json: state ? l.cloneDeep(state) : {},
    })
  }

  function getPageSettings(pageKey: string) {
    const { result: userSettingResult, loading: userSettingLoading } = useQuery(
      graphql(/* GraphQL */ `
        query useSettings_GetUserSetting($user_id: uuid!, $path: String!) {
          user_setting(
            where: { user_id: { _eq: $user_id }, path: { _eq: $path } }
          ) {
            id
            json
          }
        }
      `),
      () => ({
        user_id: userId.value,
        path: pageKey,
      }),
      { fetchPolicy: 'network-only' },
    )

    const settings = computed(() => {
      const data = userSettingResult.value?.user_setting?.[0]?.json
      return data ? l.cloneDeep(data) : {}
    })

    return {
      settings,
      loading: userSettingLoading,
    }
  }

  return {
    getPageSettings,
    savePageSettings,
  }
}

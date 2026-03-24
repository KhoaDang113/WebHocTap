import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/usersApi'
import type { UserPayload } from '@/types'

const USERS_KEY = ['users']

type UseUsersOptions = {
  enabled?: boolean
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const hasAccessToken = Boolean(localStorage.getItem('accessToken'))

  return useQuery({
    queryKey: USERS_KEY,
    queryFn: usersApi.getAll,
    enabled: (options.enabled ?? true) && hasAccessToken,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserPayload) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserPayload }) =>
      usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export const useLockUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.lock(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

export const useUnlockUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.unlock(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

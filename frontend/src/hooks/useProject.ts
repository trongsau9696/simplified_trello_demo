import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '@/api/projects'
import { AxiosError } from 'axios'
import { ApiError } from '@/types'
import toast from 'react-hot-toast'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.list(),
  })
}

export function useInfiniteProjects() {
  return useInfiniteQuery({
    queryKey: ['projects', 'infinite'],
    queryFn: ({ pageParam }: { pageParam?: string }) => projectApi.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.next_cursor ?? undefined,
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.get(id),
    enabled: !!id,
  })
}

export function useProjectStats(id: number) {
  return useQuery({
    queryKey: ['projects', id, 'stats'],
    queryFn: () => projectApi.stats(id),
    refetchInterval: 30_000, // Poll every 30s
    enabled: !!id,
  })
}

export function useKanban(projectId: number) {
  return useQuery({
    queryKey: ['projects', projectId, 'kanban'],
    queryFn: () => projectApi.kanban(projectId),
    enabled: !!projectId,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created!')
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
  })
}
export function useUpdateProject(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; description?: string }) => projectApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', id] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated!')
    },
  })
}

export function useInviteMember(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; role: string }) => projectApi.invite(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] })
      toast.success('Member invited successfully!')
    },
  })
}

export function useRemoveMember(projectId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => projectApi.removeMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] })
      toast.success('Member removed')
    },
    onError: (err: unknown) => {
      const axiosError = err as AxiosError<ApiError>
      const msg = axiosError.response?.data?.message || 'Failed to remove member'
      toast.error(msg)
    }
  })
}

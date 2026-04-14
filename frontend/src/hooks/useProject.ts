import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '@/api/projects'
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

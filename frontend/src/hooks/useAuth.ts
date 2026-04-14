import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()
  const setActiveProject = useProjectStore(s => s.setActiveProject)

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: data => {
      setAuth(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}!`)
    },
    onError: () => {
      toast.error('Invalid credentials')
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: data => {
      setAuth(data.user, data.token)
      toast.success('Account created!')
    },
  })

  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      setActiveProject(null)
      storeLogout()
    },
    onError: () => {
      queryClient.clear()
      setActiveProject(null)
      storeLogout()
    },
  })

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}

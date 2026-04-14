// ─── Auth ─────────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  role?: 'owner' | 'editor' | 'viewer'
}

export interface AuthResponse {
  user: User
  token: string
}

// ─── Project ──────────────────────────────────────────────
export interface Project {
  id: number
  name: string
  description?: string
  owner: User
  members?: User[]
  tasks_count?: number
  my_role?: 'owner' | 'editor' | 'viewer'
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  total: number
  done: number
  in_progress: number
  todo: number
  overdue: number
  completion_rate: number
}

// ─── Task ─────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  due_date?: string
  is_overdue: boolean
  assignee?: User
  project?: Project
  comments?: Comment[]
  comments_count?: number
  created_at: string
  updated_at: string
}

export interface KanbanBoard {
  todo: Task[]
  in_progress: Task[]
  done: Task[]
}

// ─── Comment ──────────────────────────────────────────────
export interface Comment {
  id: number
  body: string
  user: User
  created_at: string
  updated_at: string
}

// ─── API ──────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  next_cursor?: string
  prev_cursor?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

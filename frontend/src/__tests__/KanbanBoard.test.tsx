import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

// MSW setup
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const kanbanData = {
  data: {
    todo:        [{ id: 1, title: 'Task 1', status: 'todo', priority: 'medium', position: 0, is_overdue: false, created_at: '', updated_at: '' }],
    in_progress: [],
    done:        [],
  },
}

function renderKanban(projectId = 1, canEdit = true) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <KanbanBoard projectId={projectId} canEdit={canEdit} />
    </QueryClientProvider>
  )
}

describe('KanbanBoard', () => {
  it('renders three columns', async () => {
    server.use(
      http.get('/api/projects/1/tasks/kanban', () => HttpResponse.json(kanbanData))
    )

    renderKanban()

    expect(await screen.findByLabelText('To Do column')).toBeInTheDocument()
    expect(await screen.findByLabelText('In Progress column')).toBeInTheDocument()
    expect(await screen.findByLabelText('Done column')).toBeInTheDocument()
  })

  it('renders task in todo column', async () => {
    server.use(
      http.get('/api/projects/1/tasks/kanban', () => HttpResponse.json(kanbanData))
    )

    renderKanban()
    expect(await screen.findByText('Task 1')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    server.use(
      http.get('/api/projects/1/tasks/kanban', async () => {
        await new Promise(r => setTimeout(r, 500))
        return HttpResponse.json(kanbanData)
      })
    )

    renderKanban()
    expect(screen.getByLabelText('Loading kanban board')).toBeInTheDocument()
  })
})

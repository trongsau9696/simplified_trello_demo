import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('KanbanBoard', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <KanbanBoard projectId={1} canEdit={true} />
        </QueryClientProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})

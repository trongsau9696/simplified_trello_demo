<?php

namespace App\Repositories;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Contracts\Pagination\CursorPaginator;

class TaskRepository
{
    /**
     * @param  array<string, mixed>  $filters
     * @return CursorPaginator<Task>
     */
    public function paginateForProject(Project $project, array $filters = [], int $perPage = 20): CursorPaginator
    {
        $query = Task::query()
            ->where('project_id', $project->id)
            ->with(['assignee:id,name,email'])
            ->withCount('comments');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['assignee_id'])) {
            $query->where('assignee_id', $filters['assignee_id']);
        }

        if (isset($filters['due_date'])) {
            $query->whereDate('due_date', $filters['due_date']);
        }

        $sortBy = $filters['sort_by'] ?? 'position';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->cursorPaginate($perPage);
    }

    /** @return array<string, Task[]> Grouped by status for Kanban */
    public function groupedByStatus(Project $project): array
    {
        $tasks = Task::query()
            ->where('project_id', $project->id)
            ->with(['assignee:id,name,email'])
            ->withCount('comments')
            ->orderBy('position')
            ->get();

        return [
            'todo' => $tasks->where('status', 'todo')->values()->all(),
            'in_progress' => $tasks->where('status', 'in_progress')->values()->all(),
            'done' => $tasks->where('status', 'done')->values()->all(),
        ];
    }

    public function findWithRelations(int $id): ?Task
    {
        return Task::with([
            'assignee:id,name,email',
            'project:id,name',
            'comments.user:id,name,email',
        ])->find($id);
    }

    /** @param  array<string, mixed>  $data */
    public function create(Project $project, array $data): Task
    {
        $data['project_id'] = $project->id;
        $data['position'] = Task::where('project_id', $project->id)
            ->where('status', $data['status'] ?? 'todo')
            ->max('position') + 1;

        return Task::create($data);
    }

    /** @param  array<string, mixed>  $data */
    public function update(Task $task, array $data): Task
    {
        $task->update($data);

        return $task->fresh() ?? $task;
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }
}

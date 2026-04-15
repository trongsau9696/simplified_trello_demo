<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Repositories\TaskRepository;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class TaskController extends Controller
{
    public function __construct(
        private readonly TaskRepository $taskRepository,
        private readonly TaskService $taskService,
    ) {
    }

    public function index(Request $request, Project $project): AnonymousResourceCollection
    {
        $this->authorize('view', $project);

        $filters = $request->only(['status', 'priority', 'assignee_id', 'due_date', 'sort_by', 'sort_order']);
        $tasks = $this->taskRepository->paginateForProject($project, $filters);

        return TaskResource::collection($tasks);
    }

    public function kanban(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $filters = $request->only(['search', 'priority', 'assignee_id', 'status', 'due_date']);
        $grouped = $this->taskRepository->groupedByStatus($project, $filters);

        return response()->json([
            'data' => [
                'todo' => TaskResource::collection($grouped['todo']),
                'in_progress' => TaskResource::collection($grouped['in_progress']),
                'done' => TaskResource::collection($grouped['done']),
            ],
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $task = $this->taskService->create($project, $request->validated(), $request->user());

        // Invalidate stats cache
        Cache::forget("project:{$project->id}:stats");

        return response()->json(new TaskResource($task), 201);
    }

    public function show(Task $task): TaskResource
    {
        $this->authorize('view', $task);

        $task->load(['assignee', 'project.owner', 'comments.user']);

        return new TaskResource($task);
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $this->authorize('update', $task);

        $updated = $this->taskService->update($task, $request->validated());

        // Invalidate stats cache
        Cache::forget("project:{$task->project_id}:stats");

        return new TaskResource($updated);
    }

    public function updateStatus(Request $request, Task $task): TaskResource
    {
        $this->authorize('updateStatus', $task);

        $request->validate(['status' => ['required', 'in:todo,in_progress,done']]);

        $updated = $this->taskService->update($task, ['status' => $request->status]);

        Cache::forget("project:{$task->project_id}:stats");

        return new TaskResource($updated);
    }

    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $request->validate([
            'tasks' => ['required', 'array'],
            'tasks.*.id' => ['required', 'exists:tasks,id'],
            'tasks.*.position' => ['required', 'integer', 'min:0'],
        ]);

        $taskPositions = [];
        foreach ($request->tasks as $t) {
            $taskPositions[$t['id']] = $t['position'];
        }

        $this->taskService->reorderTasks($project, $taskPositions);

        return response()->json(['message' => 'Tasks reordered']);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $this->taskService->delete($task);

        Cache::forget("project:{$task->project_id}:stats");

        return response()->json(['message' => 'Task deleted']);
    }
}

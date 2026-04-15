<?php

namespace App\Services;

use App\Events\TaskCreated as TaskCreatedEvent;
use App\Events\TaskStatusUpdated;
use App\Jobs\SendTaskAssigned;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Repositories\TaskRepository;

class TaskService
{
    public function __construct(
        private readonly TaskRepository $taskRepository,
    ) {
    }

    /** @param array<string, mixed> $data */
    public function create(Project $project, array $data, User $creator): Task
    {
        if (isset($data['assignee_id'])) {
            $this->ensureAssigneeIsMember($project, (int) $data['assignee_id']);
        }

        $task = $this->taskRepository->create($project, $data);

        if ($task->assignee_id) {
            /** @var User $assignee */
            $assignee = User::find($task->assignee_id);
            SendTaskAssigned::dispatch($task, $assignee);
        }

        $task->load(['assignee:id,name,email', 'project:id,name']);

        // Broadcast real-time event
        broadcast(new TaskCreatedEvent($task))->toOthers();

        return $task;
    }

    /** @param array<string, mixed> $data */
    public function update(Task $task, array $data): Task
    {
        $oldAssigneeId = $task->assignee_id;
        $statusChanged = isset($data['status']) && $data['status'] !== $task->status;

        if (
            isset($data['assignee_id'])
            && $data['assignee_id'] !== $oldAssigneeId
        ) {
            $this->ensureAssigneeIsMember($task->project, (int) $data['assignee_id']);
        }

        $updated = $this->taskRepository->update($task, $data);

        // Notify new assignee if changed
        if (
            isset($data['assignee_id'])
            && $data['assignee_id'] !== $oldAssigneeId
        ) {
            /** @var User $assignee */
            $assignee = User::find($data['assignee_id']);
            SendTaskAssigned::dispatch($updated, $assignee);
        }

        // Broadcast status change to all project members
        if ($statusChanged) {
            broadcast(new TaskStatusUpdated($updated))->toOthers();
        }

        return $updated;
    }

    public function delete(Task $task): void
    {
        $this->taskRepository->delete($task);
    }

    private function ensureAssigneeIsMember(Project $project, int $userId): void
    {
        if (! $project->members()->where('user_id', $userId)->exists()) {
            throw new \InvalidArgumentException('The assignee must be a member of the project.');
        }
    }
}

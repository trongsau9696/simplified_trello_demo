<?php

namespace App\Services;

use App\Jobs\SendTaskAssigned;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Repositories\TaskRepository;

class TaskService
{
    public function __construct(
        private readonly TaskRepository $taskRepository,
    ) {}

    public function create(Project $project, array $data, User $creator): Task
    {
        $task = $this->taskRepository->create($project, $data);

        if ($task->assignee_id) {
            /** @var User $assignee */
            $assignee = User::find($task->assignee_id);
            SendTaskAssigned::dispatch($task, $assignee);
        }

        return $task->load(['assignee:id,name,email', 'project:id,name']);
    }

    public function update(Task $task, array $data): Task
    {
        $oldAssigneeId = $task->assignee_id;
        $updated       = $this->taskRepository->update($task, $data);

        // Notify new assignee if changed
        if (
            isset($data['assignee_id'])
            && $data['assignee_id'] !== $oldAssigneeId
            && $data['assignee_id'] !== null
        ) {
            /** @var User $assignee */
            $assignee = User::find($data['assignee_id']);
            SendTaskAssigned::dispatch($updated, $assignee);
        }

        return $updated;
    }

    public function delete(Task $task): void
    {
        $this->taskRepository->delete($task);
    }
}

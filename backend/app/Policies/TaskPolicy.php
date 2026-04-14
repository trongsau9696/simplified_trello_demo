<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        return $task->project->isMember($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    /** Members may only edit their own tasks (or owner/editor of the project) */
    public function update(User $user, Task $task): bool
    {
        $role = $task->project->getRoleForUser($user);

        if (in_array($role, ['owner', 'editor'])) {
            return true;
        }

        // Viewer can only update tasks assigned to them
        return $task->assignee_id === $user->id;
    }

    public function updateStatus(User $user, Task $task): bool
    {
        return $this->update($user, $task);
    }

    public function delete(User $user, Task $task): bool
    {
        $role = $task->project->getRoleForUser($user);

        return in_array($role, ['owner', 'editor']);
    }

    public function restore(User $user, Task $task): bool
    {
        return $this->delete($user, $task);
    }
}

<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return $project->isMember($user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Project $project): bool
    {
        $role = $project->getRoleForUser($user);

        return in_array($role, ['owner', 'editor']);
    }

    /** Only the project owner can delete a project */
    public function delete(User $user, Project $project): bool
    {
        return $project->isOwner($user);
    }

    public function restore(User $user, Project $project): bool
    {
        return $project->isOwner($user);
    }

    public function forceDelete(User $user, Project $project): bool
    {
        return $project->isOwner($user);
    }

    /** Invite members to a project */
    public function invite(User $user, Project $project): bool
    {
        return $project->isOwner($user);
    }
}

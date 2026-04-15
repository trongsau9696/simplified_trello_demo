<?php

namespace App\Repositories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;

class ProjectRepository
{
    /**
     * @return CursorPaginator<Project>
     */
    public function paginateForUser(User $user, int $perPage = 15): CursorPaginator
    {
        return Project::query()
            ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->with(['owner:id,name,email', 'members:id,name'])
            ->withCount([
                'tasks',
                'tasks as done_tasks_count' => fn ($q) => $q->where('status', 'done'),
            ])
            ->latest()
            ->cursorPaginate($perPage);
    }

    public function findWithRelations(int $id): ?Project
    {
        return Project::with([
            'owner:id,name,email',
            'members:id,name,email',
        ])->find($id);
    }

    public function create(array $data, User $owner): Project
    {
        $data['owner_id'] = $owner->id;

        /** @var Project $project */
        $project = Project::create($data);

        // Add owner as member with 'owner' role
        $project->members()->attach($owner->id, ['role' => 'owner']);

        return $project;
    }

    public function update(Project $project, array $data): Project
    {
        $project->update($data);

        return $project->fresh() ?? $project;
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    public function addMember(Project $project, User $user, string $role): void
    {
        $project->members()->syncWithoutDetaching([
            $user->id => ['role' => $role],
        ]);
    }

    public function removeMember(Project $project, int $userId): void
    {
        $project->members()->detach($userId);
    }
}

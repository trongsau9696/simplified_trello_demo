<?php

namespace App\Services;

use App\Jobs\SendMemberInvitation;
use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;

class ProjectService
{
    public function __construct(
        private readonly ProjectRepository $projectRepository,
    ) {}

    public function create(array $data, User $owner): Project
    {
        return $this->projectRepository->create($data, $owner);
    }

    public function update(Project $project, array $data): Project
    {
        return $this->projectRepository->update($project, $data);
    }

    public function delete(Project $project): void
    {
        $this->projectRepository->delete($project);
    }

    public function inviteMember(Project $project, string $email, string $role): User
    {
        /** @var User $user */
        $user = User::where('email', $email)->firstOrFail();

        $this->projectRepository->addMember($project, $user, $role);

        // Dispatch async notification
        SendMemberInvitation::dispatch($project, $user);

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    public function getStats(Project $project): array
    {
        $tasks = $project->tasks()->withTrashed(false)->get();

        $total       = $tasks->count();
        $done        = $tasks->where('status', 'done')->count();
        $overdue     = $tasks->filter(fn (mixed $t) => method_exists($t, 'isOverdue') && $t->isOverdue())->count();
        $inProgress  = $tasks->where('status', 'in_progress')->count();

        return [
            'total'           => $total,
            'done'            => $done,
            'in_progress'     => $inProgress,
            'todo'            => $tasks->where('status', 'todo')->count(),
            'overdue'         => $overdue,
            'completion_rate' => $total > 0 ? round(($done / $total) * 100, 1) : 0,
        ];
    }
    public function removeMember(Project $project, int $userId): void
    {
        // Don't allow removing the owner
        if ($project->owner_id === $userId) {
            throw new \InvalidArgumentException("Cannot remove the project owner.");
        }

        $this->projectRepository->removeMember($project, $userId);
    }
}

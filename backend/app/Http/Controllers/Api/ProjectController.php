<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\InviteMemberRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Repositories\ProjectRepository;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class ProjectController extends Controller
{
    public function __construct(
        private readonly ProjectRepository $projectRepository,
        private readonly ProjectService $projectService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $projects = $this->projectRepository->paginateForUser($request->user());

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->create($request->validated(), $request->user());

        return response()->json(new ProjectResource($project->load(['owner'])), 201);
    }

    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        $project->load(['owner', 'members']);

        return new ProjectResource($project);
    }

    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $this->authorize('update', $project);

        $project = $this->projectService->update($project, $request->validated());

        return new ProjectResource($project);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $this->projectService->delete($project);

        return response()->json(['message' => 'Project deleted'], 200);
    }

    public function invite(InviteMemberRequest $request, Project $project): JsonResponse
    {
        $this->authorize('invite', $project);

        $user = $this->projectService->inviteMember(
            $project,
            $request->email,
            $request->role,
        );

        return response()->json(['message' => "User {$user->name} invited as {$request->role}"], 200);
    }

    public function removeMember(Request $request, Project $project, int $userId): JsonResponse
    {
        $this->authorize('invite', $project);

        try {
            $this->projectService->removeMember($project, $userId);
            return response()->json(['message' => 'Member removed successfully'], 200);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function stats(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $cacheKey = "project:{$project->id}:stats";

        $stats = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($project) {
            return $this->projectService->getStats($project);
        });

        return response()->json(['data' => $stats]);
    }
}

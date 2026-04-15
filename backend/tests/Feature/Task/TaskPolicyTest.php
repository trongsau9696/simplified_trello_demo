<?php

namespace Tests\Feature\Task;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_viewer_cannot_delete_task(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $this->actingAs($viewer, 'sanctum');

        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($viewer->id, ['role' => 'viewer']);

        $task = Task::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $owner->id, // Not the viewer
        ]);

        $this->deleteJson("/api/tasks/{$task->id}")
            ->assertForbidden();
    }

    public function test_viewer_can_update_own_assigned_task(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $this->actingAs($viewer, 'sanctum');

        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($viewer->id, ['role' => 'viewer']);

        $task = Task::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $viewer->id,
            'status' => 'todo',
        ]);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_progress'])
            ->assertOk();
    }

    public function test_editor_can_update_any_task(): void
    {
        $owner = User::factory()->create();
        $editor = User::factory()->create();
        $this->actingAs($editor, 'sanctum');

        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->members()->attach($owner->id, ['role' => 'owner']);
        $project->members()->attach($editor->id, ['role' => 'editor']);

        $task = Task::factory()->create([
            'project_id' => $project->id,
            'assignee_id' => $owner->id,
        ]);

        $this->putJson("/api/tasks/{$task->id}", ['title' => 'Updated by editor'])
            ->assertOk();
    }

    public function test_non_member_cannot_access_task(): void
    {
        $stranger = User::factory()->create();
        $this->actingAs($stranger, 'sanctum');

        $task = Task::factory()->create();

        $this->getJson("/api/tasks/{$task->id}")
            ->assertForbidden();
    }
}

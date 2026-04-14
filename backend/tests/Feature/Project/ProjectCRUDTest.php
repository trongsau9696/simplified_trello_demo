<?php

namespace Tests\Feature\Project;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectCRUDTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        return $user;
    }

    public function test_user_can_create_project(): void
    {
        $this->actingAsUser();

        $this->postJson('/api/projects', [
            'name'        => 'My Project',
            'description' => 'A test project',
        ])->assertCreated()
            ->assertJsonPath('name', 'My Project');

        $this->assertDatabaseHas('projects', ['name' => 'My Project']);
    }

    public function test_user_can_list_their_projects(): void
    {
        $user = $this->actingAsUser();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $project->members()->attach($user->id, ['role' => 'owner']);

        $this->getJson('/api/projects')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_owner_can_delete_project(): void
    {
        $user = $this->actingAsUser();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $project->members()->attach($user->id, ['role' => 'owner']);

        $this->deleteJson("/api/projects/{$project->id}")
            ->assertOk();

        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }

    public function test_non_owner_cannot_delete_project(): void
    {
        $owner  = User::factory()->create();
        $member = User::factory()->create();
        $this->actingAs($member, 'sanctum');

        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->members()->attach($owner->id,  ['role' => 'owner']);
        $project->members()->attach($member->id, ['role' => 'editor']);

        $this->deleteJson("/api/projects/{$project->id}")
            ->assertForbidden();
    }

    public function test_non_member_cannot_view_project(): void
    {
        $this->actingAsUser();
        $project = Project::factory()->create();

        $this->getJson("/api/projects/{$project->id}")
            ->assertForbidden();
    }
}

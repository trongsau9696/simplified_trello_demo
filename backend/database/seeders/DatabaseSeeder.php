<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Demo users ──────────────────────────────────────────
        $owner = User::factory()->create([
            'name'     => 'Alice Owner',
            'email'    => 'alice@example.com',
            'password' => Hash::make('password'),
        ]);

        $editor = User::factory()->create([
            'name'     => 'Bob Editor',
            'email'    => 'bob@example.com',
            'password' => Hash::make('password'),
        ]);

        $viewer = User::factory()->create([
            'name'     => 'Carol Viewer',
            'email'    => 'carol@example.com',
            'password' => Hash::make('password'),
        ]);

        // Extra members
        $extras = User::factory(3)->create();
        $allMembers = collect([$owner, $editor, $viewer])->merge($extras);

        // ─── 5 Projects ──────────────────────────────────────────
        $projects = Project::factory(5)->create(['owner_id' => $owner->id]);

        foreach ($projects as $project) {
            // Attach owner
            $project->members()->attach($owner->id, ['role' => 'owner']);

            // Attach editor and viewer
            $project->members()->attach($editor->id, ['role' => 'editor']);
            $project->members()->attach($viewer->id, ['role' => 'viewer']);

            // Attach random extras
            foreach ($extras->random(rand(1, 3)) as $extra) {
                $project->members()->syncWithoutDetaching([
                    $extra->id => ['role' => 'viewer'],
                ]);
            }

            // ─── 4 tasks per project (20 total) ──────────────────
            $tasks = Task::factory(4)->create([
                'project_id'  => $project->id,
                'assignee_id' => $allMembers->random()->id,
            ]);

            // ─── 2–4 comments per task ────────────────────────────
            foreach ($tasks as $task) {
                Comment::factory(rand(2, 4))->create([
                    'task_id' => $task->id,
                    'user_id' => $allMembers->random()->id,
                ]);
            }
        }

        $this->command->info('✅ Seeded: 6 users, 5 projects, 20 tasks, comments');
        $this->command->info('📧 Login: alice@example.com / password');
    }
}

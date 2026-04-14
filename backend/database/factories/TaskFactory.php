<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id'  => Project::factory(),
            'title'       => $this->faker->sentence(5),
            'description' => $this->faker->paragraph(),
            'status'      => $this->faker->randomElement(['todo', 'in_progress', 'done']),
            'priority'    => $this->faker->randomElement(['low', 'medium', 'high']),
            'assignee_id' => null,
            'due_date'    => $this->faker->optional(0.7)->dateTimeBetween('now', '+30 days'),
            'position'    => $this->faker->numberBetween(0, 100),
        ];
    }
}

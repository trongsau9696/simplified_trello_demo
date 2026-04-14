<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Task $task,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("project.{$this->task->project_id}");
    }

    public function broadcastAs(): string
    {
        return 'task.created';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'id'       => $this->task->id,
            'title'    => $this->task->title,
            'status'   => $this->task->status,
            'priority' => $this->task->priority,
            'position' => $this->task->position,
        ];
    }
}

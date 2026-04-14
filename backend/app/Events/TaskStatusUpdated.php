<?php

namespace App\Events;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Task $task,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("project.{$this->task->project_id}");
    }

    public function broadcastAs(): string
    {
        return 'task.status.updated';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'id'     => $this->task->id,
            'status' => $this->task->status,
            'position' => $this->task->position,
        ];
    }
}

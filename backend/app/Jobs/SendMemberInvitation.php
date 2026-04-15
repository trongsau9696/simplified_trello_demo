<?php

namespace App\Jobs;

use App\Models\Project;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendMemberInvitation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly Project $project,
        public readonly User $user,
    ) {
    }

    public function handle(): void
    {
        // TODO: implement Mailable
        Log::info("Member invited: user={$this->user->email} project={$this->project->name}");
    }
}

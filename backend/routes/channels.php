<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. A public channel is open to any request.
|
*/

// Public project channel — anyone with a Sanctum token can listen
Broadcast::channel('project.{projectId}', function ($user, $projectId) {
    return $user->projects()->where('projects.id', $projectId)->exists();
});

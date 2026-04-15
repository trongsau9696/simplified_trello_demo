<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommentController extends Controller
{
    public function index(Task $task): AnonymousResourceCollection
    {
        $this->authorize('view', $task);

        $comments = $task->comments()
            ->with('user:id,name,email')
            ->latest()
            ->cursorPaginate(20);

        return CommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        $comment->load('user');

        return response()->json(new CommentResource($comment), 201);
    }

    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}

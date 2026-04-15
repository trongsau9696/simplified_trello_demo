<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int|null $tasks_count
 * @property int|null $done_tasks_count
 * @property object{role: string} $pivot
 * @use HasFactory<\Database\Factories\ProjectFactory>
 */
class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'owner_id',
    ];

    // ─── Relationships ───────────────────────────────────────

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsToMany<User, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /** @return HasMany<Task, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function getRoleForUser(User $user): ?string
    {
        $member = $this->members()->where('user_id', $user->id)->first();

        if (! $member) {
            return null;
        }

        /** @var object{role: string} $pivot */
        $pivot = $member->pivot;

        return $pivot->role;
    }

    public function isOwner(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function isMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }
}

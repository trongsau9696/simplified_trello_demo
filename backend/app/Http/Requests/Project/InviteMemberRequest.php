<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class InviteMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', 'in:editor,viewer'],
        ];
    }
}

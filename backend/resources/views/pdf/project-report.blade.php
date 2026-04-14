<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Report — {{ $project->name }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #1e293b;
            background: #fff;
            padding: 2rem;
        }

        /* ─── Header ─────────────────────────────────────── */
        .header {
            border-bottom: 3px solid #6366f1;
            padding-bottom: 1rem;
            margin-bottom: 1.5rem;
        }
        .header h1 { font-size: 22px; color: #4f46e5; font-weight: 700; }
        .header p { color: #64748b; font-size: 11px; margin-top: 4px; }

        /* ─── Stats ──────────────────────────────────────── */
        .stats {
            display: table;
            width: 100%;
            margin-bottom: 1.5rem;
            border-collapse: separate;
            border-spacing: 8px;
        }
        .stat { display: table-cell; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
        .stat-num { font-size: 24px; font-weight: 700; color: #6366f1; display: block; }
        .stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

        .progress-bar-wrap { background: #e2e8f0; border-radius: 4px; height: 8px; margin: 1rem 0; }
        .progress-bar { background: #6366f1; border-radius: 4px; height: 8px; }

        /* ─── Members ────────────────────────────────────── */
        .section-title {
            font-size: 13px; font-weight: 700;
            color: #334155; margin: 1.5rem 0 0.75rem;
            padding-bottom: 0.25rem;
            border-bottom: 1px solid #e2e8f0;
        }

        .member-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 600;
            margin: 2px;
        }
        .role-owner   { background: #ede9fe; color: #6d28d9; }
        .role-editor  { background: #dcfce7; color: #15803d; }
        .role-viewer  { background: #fef3c7; color: #92400e; }

        /* ─── Task Table ─────────────────────────────────── */
        table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
        th {
            background: #6366f1; color: white;
            padding: 8px 10px; text-align: left;
            font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        tr:nth-child(even) td { background: #f8fafc; }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
        }

        /* Status */
        .status-todo        { background: #ede9fe; color: #6d28d9; }
        .status-in_progress { background: #fef3c7; color: #92400e; }
        .status-done        { background: #dcfce7; color: #15803d; }

        /* Priority */
        .priority-high   { background: #fee2e2; color: #991b1b; }
        .priority-medium { background: #fef3c7; color: #92400e; }
        .priority-low    { background: #dcfce7; color: #15803d; }

        .overdue { color: #ef4444; font-weight: 700; }

        /* ─── Footer ─────────────────────────────────────── */
        .footer {
            margin-top: 2rem;
            padding-top: 0.75rem;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
        }

        .page-break { page-break-before: always; }
    </style>
</head>
<body>

    {{-- Header --}}
    <div class="header">
        <h1>📋 {{ $project->name }}</h1>
        <p>{{ $project->description ?? 'No description' }}</p>
        <p style="margin-top:6px; color:#94a3b8;">
            Generated on {{ now()->format('F j, Y \a\t H:i') }} UTC
            &nbsp;·&nbsp; Owner: {{ $project->owner->name }}
        </p>
    </div>

    {{-- Stats --}}
    <div class="stats">
        <div class="stat">
            <span class="stat-num">{{ $stats['total'] }}</span>
            <span class="stat-label">Total Tasks</span>
        </div>
        <div class="stat">
            <span class="stat-num" style="color:#6366f1">{{ $stats['todo'] }}</span>
            <span class="stat-label">To Do</span>
        </div>
        <div class="stat">
            <span class="stat-num" style="color:#f59e0b">{{ $stats['in_progress'] }}</span>
            <span class="stat-label">In Progress</span>
        </div>
        <div class="stat">
            <span class="stat-num" style="color:#10b981">{{ $stats['done'] }}</span>
            <span class="stat-label">Done</span>
        </div>
        <div class="stat">
            <span class="stat-num" style="color:#ef4444">{{ $stats['overdue'] }}</span>
            <span class="stat-label">Overdue</span>
        </div>
    </div>

    {{-- Completion bar --}}
    <p style="font-size:11px; color:#64748b; margin-bottom:4px;">Completion: {{ $stats['completion_rate'] }}%</p>
    <div class="progress-bar-wrap">
        <div class="progress-bar" style="width: {{ $stats['completion_rate'] }}%"></div>
    </div>

    {{-- Members --}}
    <p class="section-title">👥 Members ({{ $members->count() }})</p>
    <div>
        @foreach($members as $member)
            <span class="member-badge role-{{ $member->pivot->role }}">
                {{ $member->name }} — {{ ucfirst($member->pivot->role) }}
            </span>
        @endforeach
    </div>

    {{-- Tasks by status --}}
    @foreach(['todo' => 'To Do', 'in_progress' => 'In Progress', 'done' => 'Done'] as $status => $label)
        @php $statusTasks = $tasks->where('status', $status) @endphp
        @if($statusTasks->isNotEmpty())
            <p class="section-title">{{ $label }} ({{ $statusTasks->count() }})</p>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($statusTasks as $task)
                        <tr>
                            <td>{{ $task->title }}</td>
                            <td>
                                <span class="badge priority-{{ $task->priority }}">
                                    {{ ucfirst($task->priority) }}
                                </span>
                            </td>
                            <td>{{ $task->assignee?->name ?? '—' }}</td>
                            <td>
                                @if($task->due_date)
                                    <span class="{{ $task->isOverdue() ? 'overdue' : '' }}">
                                        {{ $task->due_date->format('M j, Y') }}
                                        @if($task->isOverdue()) ⚠️ @endif
                                    </span>
                                @else
                                    —
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    @endforeach

    {{-- Footer --}}
    <div class="footer">
        Simplified Trello &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; Page 1 of 1
    </div>

</body>
</html>

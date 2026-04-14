<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\ProjectService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ProjectService $projectService,
    ) {}

    public function projectPdf(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load(['owner', 'members', 'tasks.assignee']);

        $stats   = $this->projectService->getStats($project);
        $tasks   = $project->tasks()->with('assignee')->orderBy('status')->orderBy('position')->get();
        $members = $project->members;

        $pdf = Pdf::loadView('pdf.project-report', compact('project', 'stats', 'tasks', 'members'))
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'dpi'                       => 150,
                'defaultFont'               => 'DejaVu Sans',
                'isRemoteEnabled'           => false,
                'isHtml5ParserEnabled'      => true,
                'isFontSubsettingEnabled'   => true,
            ]);

        $filename = 'project-' . $project->id . '-report-' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }
}

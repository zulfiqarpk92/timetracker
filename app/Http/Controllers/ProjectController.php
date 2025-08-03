<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        
        // Validate perPage to ensure it's within reasonable limits
        if (!in_array($perPage, [10, 25, 50, 100])) {
            $perPage = 10;
        }
        
        $projects = Project::with('client')
            ->orderBy('name')
            ->paginate($perPage)
            ->appends($request->query());
            
        return Inertia::render('ProjectsList', [
            'projects' => $projects,
        ]);
    }

    public function create()
    {
        $clients = Client::orderBy('name')->get(['id', 'name']);
        return Inertia::render('ProjectCreate', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
        ]);
        Project::create($validated);
        return redirect()->route('projects.index')->with('success', 'Project created.');
    }

    public function edit(Project $project)
    {
        $clients = Client::orderBy('name')->get(['id', 'name']);
        return Inertia::render('ProjectEdit', [
            'project' => $project,
            'clients' => $clients,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
        ]);
        // dd($validated); // Debugging line, remove in production
        $project->update($validated);
        return redirect()->route('projects.index')->with('success', 'Project updated.');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->route('projects.index')->with('success', 'Project deleted.');
    }
}

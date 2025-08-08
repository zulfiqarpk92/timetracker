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
        
        $query = Project::with('client');
        
        // Determine if we need to join clients table
        $needsClientJoin = $request->filled('client') || $request->filled('tag') || in_array($request->get('sort'), ['client', 'tag']);
        
        if ($needsClientJoin) {
            $query->leftJoin('clients', 'projects.client_id', '=', 'clients.id')
                  ->select('projects.*');
        }
        
        // Search functionality
        if ($request->filled('search')) {
            $searchTerm = $request->get('search');
            $query->where('projects.name', 'like', '%' . $searchTerm . '%');
        }
        
        // Client filter
        if ($request->filled('client')) {
            $clientName = $request->get('client');
            $query->where('clients.name', $clientName);
        }
        
        // Tag filter
        if ($request->filled('tag')) {
            $tagName = $request->get('tag');
            $query->whereRaw('JSON_CONTAINS(clients.tags, ?)', ['"' . $tagName . '"']);
        }
        
        // Sorting
        $sortBy = $request->get('sort', 'name');
        $sortOrder = $request->get('order', 'asc');
        
        // Validate sort parameters
        $allowedSortFields = ['name', 'tag', 'client'];
        $allowedSortOrders = ['asc', 'desc'];
        
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'name';
        }
        
        if (!in_array($sortOrder, $allowedSortOrders)) {
            $sortOrder = 'asc';
        }
        
        // Apply sorting
        if ($sortBy === 'client') {
            $query->orderBy('clients.name', $sortOrder);
        } elseif ($sortBy === 'tag') {
            // Sort by the first tag in the client's tags array
            $query->orderByRaw("JSON_UNQUOTE(JSON_EXTRACT(clients.tags, '$[0]')) {$sortOrder}");
        } elseif ($sortBy === 'name') {
            $query->orderBy('projects.name', $sortOrder);
        } else {
            $query->orderBy('projects.' . $sortBy, $sortOrder);
        }
        
        $projects = $query->paginate($perPage)->appends($request->query());
        
        // Get filters for frontend
        $filters = [
            'search' => $request->get('search'),
            'client' => $request->get('client'),
            'tag' => $request->get('tag'),
            'sort' => $sortBy,
            'order' => $sortOrder,
        ];
            
        return Inertia::render('ProjectsList', [
            'projects' => $projects,
            'filters' => $filters,
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

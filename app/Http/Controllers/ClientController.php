<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search', '');
        
        // Validate perPage to ensure it's within reasonable limits
        if (!in_array($perPage, [10, 25, 50, 100])) {
            $perPage = 10;
        }
        
        $query = Client::withCount('projects')->orderBy('name');
        
        // Apply search filter if search term is provided
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhereJsonContains('tags', $search)
                  ->orWhere('tags', 'like', '%' . $search . '%');
            });
        }
        
        $clients = $query->paginate($perPage)->appends($request->query());
            
        return Inertia::render('ClientsList', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('ClientCreate');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);
        Client::create($validated);
        return redirect()->route('clients.index')->with('success', 'Client created.');
    }

    public function edit(Client $client)
    {
        return Inertia::render('ClientEdit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);
        $client->update($validated);
        return redirect()->route('clients.index')->with('success', 'Client updated.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Client deleted.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('perPage', 10);
            $search = $request->get('search', '');
            
            // Validate perPage to ensure it's within reasonable limits
            if (!in_array($perPage, [10, 25, 50, 100])) {
                $perPage = 10;
            }
            
            $query = Client::query()->orderBy('name');
            
            // Apply search filter if search term is provided
            if (!empty($search)) {
                $query->where('name', 'like', '%' . $search . '%');
            }
            
            $clients = $query->paginate($perPage)->appends($request->query());
            
            // Calculate weekly hours for each client and format as HH:MM
            $startOfWeek = now()->startOfWeek()->format('Y-m-d');
            $endOfWeek = now()->endOfWeek()->format('Y-m-d');
            
            $clients->getCollection()->transform(function ($client) use ($startOfWeek, $endOfWeek) {
                // Get the sum of hours for this week
                $weeklyHours = $client->workHours()
                    ->whereBetween('date', [$startOfWeek, $endOfWeek])
                    ->sum('hours');
                
                // Convert decimal hours to HH:MM format
                $hours = floor($weeklyHours);
                $minutes = round(($weeklyHours - $hours) * 60);
                
                // Format as HH:MM
                $client->weekly_hours_worked = sprintf('%02d:%02d', $hours, $minutes);
                
                return $client;
            });
                
            return Inertia::render('ClientsList', [
                'clients' => $clients,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('ClientController index error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
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

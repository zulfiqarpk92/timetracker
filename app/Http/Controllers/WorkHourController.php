<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WorkHour;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkHourController extends Controller
{

    private $trackers;

    public function __construct()
    {
        $this->trackers = config('workhours.trackers', []);
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $query = WorkHour::with('user', 'project', 'project.client');
        
        // If user is employee, only show their own work hours
        if ($user->role === 'employee') {
            $query->where('user_id', $user->id);
        }
        
        $filter = $request->input('filter', 'all');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $workType = $request->input('workType', 'all');
        if ($filter !== 'all' && $startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }
        if ($workType !== 'all') {
            $query->where('work_type', $workType);
        }
        $workHours = $query->orderByDesc('date')->get();
        return Inertia::render('WorkHoursList', [
            'workHours' => $workHours,
            'filter' => $filter,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'workType' => $workType,
            'flash' => [
                'success' => $request->session()->get('success') ?? '',
                'error' => $request->session()->get('error') ?? ''
            ],
        ]);
    }

    public function create()
    {
        $projects = Project::select('id', 'name', 'client_id')
            ->with(['client:id,name'])
            ->orderBy('name')
            ->get();
        return Inertia::render('WorkHourCreate', [
            'trackers' => $this->trackers,
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'hours' => 'required|integer|min:0|max:24',
            'minutes' => 'required|integer|min:0|max:59',
            'description' => 'nullable|string',
            'work_type' => 'nullable|string',
            'project_id' => 'nullable|integer|exists:projects,id',
            'tracker' => 'nullable|string',
        ]);
        $validated['user_id'] = $request->user()->id;
        $validated['hours'] = $validated['hours'] + ($validated['minutes'] / 60);
        unset($validated['minutes']);
        WorkHour::create($validated);
        return redirect()->route('work-hours.index')
            ->with('success', 'Work hour entry created successfully.');
    }

    public function edit(WorkHour $workHour)
    {
        // Check if user can edit this work hour entry
        $user = auth()->user();
        if ($user->role === 'employee' && $workHour->user_id !== $user->id) {
            return redirect()->route('work-hours.index')->with('error', 'You can only edit your own work entries.');
        }

        $projects = Project::select('id', 'name', 'client_id')
            ->with(['client:id,name'])
            ->orderBy('name')
            ->get();
        return Inertia::render('WorkHourEdit', [
            'workHour' => $workHour,
            'trackers' => $this->trackers,
            'projects' => $projects,
        ]);
    }

    public function update(Request $request, WorkHour $workHour)
    {
        // Check if user can update this work hour entry
        $user = auth()->user();
        if ($user->role === 'employee' && $workHour->user_id !== $user->id) {
            return redirect()->route('work-hours.index')->with('error', 'You can only update your own work entries.');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'hours' => 'required|integer|min:0|max:24',
            'minutes' => 'required|integer|min:0|max:59',
            'description' => 'nullable|string',
            'work_type' => 'nullable|string',
            'project_id' => 'nullable|integer|exists:projects,id',
            'tracker' => 'nullable|string',
        ]);
        $validated['hours'] = $validated['hours'] + ($validated['minutes'] / 60);
        unset($validated['minutes']);
        $workHour->update($validated);
        return redirect()->route('work-hours.index')
            ->with('success', 'Work hour entry updated successfully.');
    }

    public function destroy(WorkHour $workHour)
    {
        // Check if user can delete this work hour entry
        $user = auth()->user();
        if ($user->role === 'employee' && $workHour->user_id !== $user->id) {
            return redirect()->route('work-hours.index')->with('error', 'You can only delete your own work entries.');
        }

        $workHour->delete();
        return redirect()->route('work-hours.index')->with('success', 'Work hour entry deleted.');
    }

    public function report(Request $request)
    {

        $query = WorkHour::with('user', 'project', 'project.client');
        $filter = $request->input('filter', 'all');
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $workType = $request->input('workType', 'all');
        $userId = $request->input('userId', 'all');
        if ($filter !== 'all' && $startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }
        if ($workType !== 'all') {
            $query->where('work_type', $workType);
        }
        if ($userId !== 'all') {
            $query->where('user_id', $userId);
        }
        $workHours = $query->orderByDesc('date')->get();
        $users = \App\Models\User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('WorkHoursReport', [
            'workHours' => $workHours,
            'users' => $users,
            'filter' => $filter,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'workType' => $workType,
            'userId' => $userId,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\WorkHour;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Calculate date ranges
        $today = Carbon::today();
        $weekStart = Carbon::today()->startOfWeek();
        $weekEnd = Carbon::today()->endOfWeek();
        $lastWeekStart = Carbon::today()->subWeek()->startOfWeek();
        $lastWeekEnd = Carbon::today()->subWeek()->endOfWeek();
        $monthStart = Carbon::today()->startOfMonth();
        $lastMonthStart = Carbon::today()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::today()->subMonth()->endOfMonth();

        // Get work hours for current user
        $userWorkHours = WorkHour::where('user_id', $user->id);
        
        // Calculate this week's hours
        $thisWeekHours = (clone $userWorkHours)
            ->whereBetween('date', [$weekStart->format('Y-m-d'), $weekEnd->format('Y-m-d')])
            ->sum('hours');
        
        // Calculate last week's hours for comparison
        $lastWeekHours = (clone $userWorkHours)
            ->whereBetween('date', [$lastWeekStart->format('Y-m-d'), $lastWeekEnd->format('Y-m-d')])
            ->sum('hours');
        
        // Calculate week over week percentage change
        $weekPercentageChange = $lastWeekHours > 0 
            ? round((($thisWeekHours - $lastWeekHours) / $lastWeekHours) * 100)
            : ($thisWeekHours > 0 ? 100 : 0);
        
        // Get unique clients count for this month
        $thisMonthClients = (clone $userWorkHours)
            ->whereBetween('date', [$monthStart->format('Y-m-d'), $today->format('Y-m-d')])
            ->distinct('client_id')
            ->count('client_id');
        
        // Get last month's client count for comparison
        $lastMonthClients = (clone $userWorkHours)
            ->whereBetween('date', [$lastMonthStart->format('Y-m-d'), $lastMonthEnd->format('Y-m-d')])
            ->distinct('client_id')
            ->count('client_id');
        
        $newClientsThisMonth = max(0, $thisMonthClients - $lastMonthClients);
        
        // Calculate efficiency (example: percentage of work days with logged hours)
        $workDaysThisMonth = $this->getWorkDaysInMonth($monthStart, $today);
        $daysWithHours = (clone $userWorkHours)
            ->whereBetween('date', [$monthStart->format('Y-m-d'), $today->format('Y-m-d')])
            ->distinct('date')
            ->count('date');
        
        $efficiency = $workDaysThisMonth > 0 
            ? round(($daysWithHours / $workDaysThisMonth) * 100)
            : 0;
        
        // Format hours display
        $hoursDisplay = $this->formatHours($thisWeekHours);
        
        // Determine efficiency status
        $efficiencyStatus = $efficiency >= 80 ? 'Above average' : 
                           ($efficiency >= 60 ? 'Average' : 'Below average');
        
        return Inertia::render('Dashboard', [
            'stats' => [
                'weekHours' => [
                    'value' => $hoursDisplay,
                    'label' => 'This Week',
                    'change' => $weekPercentageChange,
                    'changeLabel' => $weekPercentageChange >= 0 ? "+{$weekPercentageChange}% from last week" : "{$weekPercentageChange}% from last week"
                ],
                'activeClients' => [
                    'value' => $thisMonthClients,
                    'label' => 'Active',
                    'change' => $newClientsThisMonth,
                    'changeLabel' => $newClientsThisMonth > 0 ? "{$newClientsThisMonth} new this month" : "No new clients"
                ],
                'efficiency' => [
                    'value' => "{$efficiency}%",
                    'label' => 'Efficiency',
                    'change' => $efficiency,
                    'changeLabel' => $efficiencyStatus
                ]
            ]
        ]);
    }
    
    private function formatHours($decimal)
    {
        if ($decimal == 0) return '0h';
        
        $hours = floor($decimal);
        $minutes = round(($decimal - $hours) * 60);
        
        if ($minutes == 0) {
            return $hours . 'h';
        } elseif ($minutes == 30) {
            return $hours . '.5h';
        } else {
            return $hours . 'h ' . $minutes . 'm';
        }
    }
    
    private function getWorkDaysInMonth($start, $end)
    {
        $workDays = 0;
        $current = $start->copy();
        
        while ($current->lte($end)) {
            // Count Monday to Friday as work days
            if ($current->isWeekday()) {
                $workDays++;
            }
            $current->addDay();
        }
        
        return $workDays;
    }
}

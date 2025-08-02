<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\WorkHour;

echo "=== DEBUGGING WORK HOURS PERMISSIONS ===\n\n";

// Get all users
$users = User::all();
echo "All Users:\n";
foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}, Role: {$user->role}\n";
}

echo "\n=== WORK HOURS DATA ===\n";
$workHours = WorkHour::with('user')->get();
foreach ($workHours as $workHour) {
    echo "WorkHour ID: {$workHour->id}, User ID: {$workHour->user_id}, User: {$workHour->user->name}, Date: {$workHour->date}, Hours: {$workHour->hours}\n";
}

echo "\n=== CHECKING LOGGED IN USER ===\n";
// Since we can't check auth in CLI, let's check if there are any sessions
$sessionFiles = glob(storage_path('framework/sessions/*'));
echo "Active session files: " . count($sessionFiles) . "\n";

echo "\nDone.\n";

<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\WorkHour;

echo "=== DETAILED DEBUGGING ===\n\n";

// Get a specific work hour that belongs to an employee
$workHour = WorkHour::find(14); // Jawad's work hour
$user = User::find(15); // Jawad

echo "Testing Work Hour ID: {$workHour->id}\n";
echo "Work Hour belongs to User ID: {$workHour->user_id}\n";
echo "Work Hour User Name: " . $workHour->user->name . "\n";
echo "Work Hour User Role: " . $workHour->user->role . "\n";
echo "\n";

echo "Current User (Jawad) ID: {$user->id}\n";
echo "Current User Name: {$user->name}\n";
echo "Current User Role: {$user->role}\n";
echo "\n";

// Test the exact condition from the controller
$canEdit = ($workHour->user_id === $user->id);
echo "Can user edit this work hour? " . ($canEdit ? "YES" : "NO") . "\n";

// Let's also check if there are any other issues
echo "\n=== Additional Checks ===\n";
echo "Work Hour exists: " . ($workHour ? "YES" : "NO") . "\n";
echo "User exists: " . ($user ? "YES" : "NO") . "\n";
echo "User ID type: " . gettype($user->id) . "\n";
echo "Work Hour User ID type: " . gettype($workHour->user_id) . "\n";
echo "Strict comparison (===): " . ($workHour->user_id === $user->id ? "MATCH" : "NO MATCH") . "\n";
echo "Loose comparison (==): " . ($workHour->user_id == $user->id ? "MATCH" : "NO MATCH") . "\n";

echo "\nDone.\n";

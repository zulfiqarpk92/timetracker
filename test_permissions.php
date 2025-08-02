<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\WorkHour;

echo "=== TESTING PERMISSION LOGIC ===\n\n";

// Test for user Jawad (ID: 15) trying to edit their own work hour (ID: 14)
$user = User::find(15); // Jawad
$workHour = WorkHour::find(14); // Jawad's work hour

echo "User: {$user->name} (ID: {$user->id}, Role: {$user->role})\n";
echo "WorkHour: ID {$workHour->id}, User ID: {$workHour->user_id}\n";

// Test the old logic
$oldLogic = ($user->role === 'employee' && $workHour->user_id !== $user->id);
echo "Old logic (would block): " . ($oldLogic ? "YES" : "NO") . "\n";

// Test the new logic  
$newLogic = ($workHour->user_id !== $user->id);
echo "New logic (would block): " . ($newLogic ? "YES" : "NO") . "\n";

echo "\n=== Testing different scenarios ===\n";

// Test employee editing their own work
echo "Employee editing own work: ";
$employee = User::find(15); // Jawad
$ownWork = WorkHour::find(14); // Jawad's work
$canEdit = ($ownWork->user_id === $employee->id);
echo ($canEdit ? "ALLOWED" : "BLOCKED") . "\n";

// Test employee editing someone else's work
echo "Employee editing other's work: ";
$employee = User::find(15); // Jawad  
$otherWork = WorkHour::find(1); // Test user's work
$canEdit = ($otherWork->user_id === $employee->id);
echo ($canEdit ? "ALLOWED" : "BLOCKED") . "\n";

// Test admin editing their own work
echo "Admin editing own work: ";
$admin = User::find(1); // Test user (admin)
$adminWork = WorkHour::find(1); // Test user's work
$canEdit = ($adminWork->user_id === $admin->id);
echo ($canEdit ? "ALLOWED" : "BLOCKED") . "\n";

echo "\nDone.\n";

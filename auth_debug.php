<?php

// Simple debug script to simulate what happens when a user tries to edit
require_once 'vendor/autoload.php';

// Bootstrap Laravel application  
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\WorkHour;

echo "=== AUTHENTICATION DEBUG ===\n\n";

// Find Jawad user and their work hours
$jawadUser = User::where('name', 'Jawad')->first();
if (!$jawadUser) {
    echo "Jawad user not found!\n";
    exit;
}

echo "Jawad User Details:\n";
echo "ID: {$jawadUser->id}\n";
echo "Name: {$jawadUser->name}\n";
echo "Email: {$jawadUser->email}\n";
echo "Role: {$jawadUser->role}\n\n";

// Get Jawad's work hours
$jawadWorkHours = WorkHour::where('user_id', $jawadUser->id)->get();
echo "Jawad's Work Hours:\n";
foreach ($jawadWorkHours as $workHour) {
    echo "ID: {$workHour->id}, Date: {$workHour->date}, Hours: {$workHour->hours}, Description: {$workHour->description}\n";
}

if ($jawadWorkHours->count() > 0) {
    $testWorkHour = $jawadWorkHours->first();
    echo "\n=== Testing Edit Permission for Work Hour {$testWorkHour->id} ===\n";
    
    // Simulate the controller logic
    $canEdit = ($testWorkHour->user_id === $jawadUser->id);
    echo "Work Hour User ID: {$testWorkHour->user_id}\n";
    echo "Current User ID: {$jawadUser->id}\n";
    echo "Can edit? " . ($canEdit ? "YES" : "NO") . "\n";
    
    // Test what would happen if someone else tried to edit
    $otherUser = User::where('id', '!=', $jawadUser->id)->first();
    if ($otherUser) {
        $canOtherEdit = ($testWorkHour->user_id === $otherUser->id);
        echo "\nIf {$otherUser->name} (ID: {$otherUser->id}) tried to edit:\n";
        echo "Can edit? " . ($canOtherEdit ? "YES" : "NO") . "\n";
    }
}

echo "\nDone.\n";

<?php
// Temporary migration script for live server
// Upload this to your live server and run it ONCE, then delete it

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "Running migrations...\n";

try {
    Artisan::call('migrate');
    echo "✅ Migrations completed successfully!\n";
    echo Artisan::output();
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
}

echo "\n=== IMPORTANT: DELETE THIS FILE AFTER RUNNING ===\n";

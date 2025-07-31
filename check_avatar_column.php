<?php
require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

try {
    $columns = Schema::getColumnListing('users');
    echo "Users table columns:\n";
    foreach ($columns as $column) {
        echo "- $column\n";
    }
    
    if (in_array('avatar', $columns)) {
        echo "\n✅ Avatar column EXISTS\n";
    } else {
        echo "\n❌ Avatar column DOES NOT EXIST\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

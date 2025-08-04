<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for better performance
        $this->addIndexIfNotExists('work_hours', 'user_id');
        $this->addIndexIfNotExists('work_hours', 'project_id');
        $this->addIndexIfNotExists('work_hours', 'date');
        $this->addIndexIfNotExists('projects', 'client_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes if they exist
        $this->dropIndexIfExists('work_hours', 'work_hours_user_id_index');
        $this->dropIndexIfExists('work_hours', 'work_hours_project_id_index');
        $this->dropIndexIfExists('work_hours', 'work_hours_date_index');
        $this->dropIndexIfExists('projects', 'projects_client_id_index');
    }

    private function addIndexIfNotExists($table, $column)
    {
        $indexName = $table . '_' . $column . '_index';
        $exists = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'");
        
        if (empty($exists)) {
            Schema::table($table, function (Blueprint $blueprint) use ($column) {
                $blueprint->index($column);
            });
        }
    }

    private function dropIndexIfExists($table, $indexName)
    {
        $exists = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'");
        
        if (!empty($exists)) {
            DB::statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
        }
    }
};
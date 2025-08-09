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
        // First, migrate existing project data to clients
        DB::transaction(function () {
            // Update work_hours to reference clients instead of projects
            DB::statement('
                UPDATE work_hours 
                SET project_id = (
                    SELECT client_id 
                    FROM projects 
                    WHERE projects.id = work_hours.project_id
                ) 
                WHERE project_id IS NOT NULL
            ');
        });

        Schema::table('work_hours', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['project_id']);
            // Rename project_id to client_id
            $table->renameColumn('project_id', 'client_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_hours', function (Blueprint $table) {
            // Rename client_id back to project_id
            $table->renameColumn('client_id', 'project_id');
        });
    }
};

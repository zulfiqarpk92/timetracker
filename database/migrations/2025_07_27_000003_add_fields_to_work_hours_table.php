<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_hours', function (Blueprint $table) {
            $table->string('work_type')->nullable()->after('description');
            $table->string('project')->nullable()->after('work_type');
            $table->string('client')->nullable()->after('project');
            $table->string('tracker')->nullable()->after('client');
        });
    }

    public function down(): void
    {
        Schema::table('work_hours', function (Blueprint $table) {
            $table->dropColumn(['work_type', 'project', 'client', 'tracker']);
        });
    }
};

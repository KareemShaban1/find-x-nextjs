<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * MySQL ENUM: add 'customer' to the role column.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'organization_owner', 'customer') NOT NULL DEFAULT 'organization_owner'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally convert existing 'customer' to 'organization_owner' before reverting
        DB::table('users')->where('role', 'customer')->update(['role' => 'organization_owner']);
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'organization_owner') NOT NULL DEFAULT 'organization_owner'");
    }
};

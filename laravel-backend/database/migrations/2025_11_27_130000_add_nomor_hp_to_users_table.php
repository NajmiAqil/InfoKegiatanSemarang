<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddNomorHpToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nomor_hp')->nullable();
        });

        // Seed random phone numbers for existing users
        $users = DB::table('users')->get();
        foreach ($users as $user) {
            $randomPhone = '08' . rand(100000000, 999999999);
            DB::table('users')->where('id', $user->id)->update(['nomor_hp' => $randomPhone]);
        }
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nomor_hp');
        });
    }
}

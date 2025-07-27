<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'hours',
        'description',
        'work_type',
        'project',
        'client',
        'tracker',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

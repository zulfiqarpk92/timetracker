<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function workHours()
    {
        return $this->hasMany(WorkHour::class);
    }
}

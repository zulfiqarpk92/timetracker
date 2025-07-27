<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;
use App\Models\Project;

class ClientProjectSeeder extends Seeder
{
    public function run()
    {
        $clients = [
            'Acme Corp',
            'Globex Inc',
            'Initech',
            'Umbrella Corp',
            'Wayne Enterprises',
        ];

        $clientIds = [];
        foreach ($clients as $name) {
            $client = Client::create(['name' => $name]);
            $clientIds[] = $client->id;
        }

        $projects = [
            ['name' => 'Website Redesign', 'client_id' => $clientIds[0]],
            ['name' => 'Mobile App', 'client_id' => $clientIds[1]],
            ['name' => 'API Integration', 'client_id' => $clientIds[2]],
            ['name' => 'Cloud Migration', 'client_id' => $clientIds[3]],
            ['name' => 'Security Audit', 'client_id' => $clientIds[4]],
            ['name' => 'E-commerce Platform', 'client_id' => $clientIds[0]],
            ['name' => 'CRM System', 'client_id' => $clientIds[1]],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}

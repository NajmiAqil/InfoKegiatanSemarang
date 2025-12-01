<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Performance Optimization Settings
    |--------------------------------------------------------------------------
    |
    | These settings help optimize Laravel application performance
    |
    */

    // Enable query caching for read-heavy operations
    'query_cache_ttl' => env('QUERY_CACHE_TTL', 300), // 5 minutes

    // Activity list cache (for public homepage)
    'activity_cache_ttl' => env('ACTIVITY_CACHE_TTL', 60), // 1 minute

    // Enable database query logging in development only
    'db_query_log' => env('DB_QUERY_LOG', false),

    // Rate limiting for API endpoints
    'api_rate_limit' => env('API_RATE_LIMIT', 60), // requests per minute

    // File upload limits
    'max_upload_size' => 20480, // 20MB in KB
    'allowed_mime_types' => [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/gif',
        'video/mp4',
        'video/avi',
        'video/mov',
    ],

    // OPD Configuration
    'opd_list' => [
        'Diskominfo',
        'Dinas PU',
        'Dinas Kesehatan',
        'Dinas Pendidikan',
        'Dinas Perhubungan',
        'Dinas Sosial',
        'Dinas Kependudukan',
        'Dinas Perdagangan',
        'Dinas Pariwisata',
        'Dinas Lingkungan Hidup',
        'Bappeda',
        'BPKD',
        'Sekretariat Daerah',
    ],
];

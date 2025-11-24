<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\News;

class NewsController extends Controller
{
    public function index()
    {
        try {
            $news = News::orderBy('created_at', 'desc')->get();
            return response()->json($news);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch news',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

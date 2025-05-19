<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewController extends Controller
{
    public function index(): JsonResource
    {
        return ReviewResource::collection(Review::all());
    }

    public function store(ReviewRequest $request): JsonResource
    {
        $review = Review::create($request->validated());
        return new ReviewResource($review);
    }

    public function show(Review $review): JsonResource
    {
        return new ReviewResource($review);
    }

    public function update(ReviewRequest $request, Review $review): JsonResource
    {
        $review->update($request->validated());
        return new ReviewResource($review);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();
        return response()->json(['message' => 'Review eliminada'], 200);
    }
}
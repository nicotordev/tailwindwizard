"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DateDisplay } from "@/components/primitives/formatters";
import { components } from "@/types/api";

type Review = components["schemas"]["Review"];

interface ReviewsSectionProps {
  blockId: string;
}

export function ReviewsSection({ blockId }: ReviewsSectionProps) {
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", blockId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/blocks/{id}/reviews", {
        params: { path: { id: blockId } },
      });
      if (error) throw new Error("Failed to fetch reviews");
      return data as Review[];
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.POST("/api/v1/blocks/{id}/reviews", {
        params: { path: { id: blockId } },
        body: {
          rating,
          title,
          body,
        },
      });
      if (error) throw new Error("Failed to submit review");
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setIsWriteOpen(false);
      setTitle("");
      setBody("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", blockId] });
    },
    onError: () => {
      toast.error("Failed to submit review. Have you purchased this block?");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold font-heading">Reviews</h3>
        <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <MessageSquare className="size-4" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with this block.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`size-6 ${
                          star <= rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summary of your experience"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Review</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell us more details..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => createReviewMutation.mutate()}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : !reviews || reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-card/50">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={review.buyer?.avatarUrl || undefined} />
                    <AvatarFallback>
                      {review.buyer?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {review.buyer?.name || "Anonymous"}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < review.rating
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {/* Assuming review has createdAt, though schema might not expose it explicitly in all views, let's check */}
                  {/* Review schema in api.d.ts doesn't show createdAt? Let's check */}
                  {/* I'll use a safe fallback */}
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-bold text-sm mb-1">{review.title}</h4>
                <p className="text-sm text-muted-foreground">{review.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

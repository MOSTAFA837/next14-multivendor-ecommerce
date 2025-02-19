import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { AddReviewSchema } from "@/lib/schemas";
import {
  ProductVariantDataType,
  ReviewDetailsType,
  ReviewWithImageType,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReactStars from "react-rating-stars-component";
import { z } from "zod";
import Select from "../ui/select";
import Input from "../ui/input";
import { Button } from "../ui/button";
import { PulseLoader } from "react-spinners";
import { toast } from "@/hooks/use-toast";
import { upsertReview } from "@/queries/review";
import { v4 } from "uuid";

interface AddReviewProps {
  productId: string;
  data?: ReviewDetailsType;
  variantsInfo: ProductVariantDataType[];
  reviews: ReviewWithImageType[];
  setReviews: Dispatch<SetStateAction<ReviewWithImageType[]>>;
  setAverageRating: Dispatch<SetStateAction<number>>;
}

export default function AddReview({
  productId,
  data,
  variantsInfo,
  setReviews,
  reviews,
  setAverageRating,
}: AddReviewProps) {
  const [activeVariant, setActiveVariant] = useState<ProductVariantDataType>(
    variantsInfo[0]
  );

  const [sizes, setSizes] = useState<{ name: string; value: string }[]>([]);

  const form = useForm<z.infer<typeof AddReviewSchema>>({
    mode: "onChange",
    resolver: zodResolver(AddReviewSchema),
    defaultValues: {
      variantName: data?.variant || activeVariant.variantName,
      variantImage: data?.variantImage || activeVariant.variantImage,
      rating: data?.rating || 0,
      size: data?.size || "",
      review: data?.review || "",
      quantity: data?.quantity || undefined,
      color: data?.color,
    },
  });

  const variants = variantsInfo.map((variant) => ({
    name: variant.variantName,
    value: variant.variantName,
    image: variant.variantImage,
    colors: variant.colors.map((color) => color.name).join(","),
  }));

  useEffect(() => {
    form.setValue("size", "");

    const name = form.getValues().variantName;
    const variant = variantsInfo.find((v) => v.variantName === name);

    if (variant) {
      const sizes_data = variant.sizes.map((s) => ({
        name: s.size,
        value: s.size,
      }));

      setActiveVariant(variant);
      if (sizes) setSizes(sizes_data);
      form.setValue("size", sizes_data[0].value);

      form.setValue("color", variant.colors.map((c) => c.name).join(","));
      form.setValue("variantImage", variant.variantImage);
    }
  }, [form, sizes, variantsInfo]);

  const isLoading = form.formState.isSubmitting;
  const errors = form.formState.errors;

  const handleSubmit = async (values: z.infer<typeof AddReviewSchema>) => {
    try {
      const response = await upsertReview(productId, {
        id: data?.id || v4(),
        variant: values.variantName,
        variantImage: values.variantImage,
        rating: values.rating,
        size: values.size,
        review: values.review,
        quantity: values.quantity,
        color: values.color,
      });

      if (response.review.id) {
        const review = reviews.filter((rev) => rev.id !== response.review.id);
        setReviews([...review, response.review]);
        setAverageRating(response.rating);
        toast({
          title: "Review submitted",
          description: "Your review has been submitted.",
        });
      }
    } catch (error) {
      toast({
        title: "Deleted category",
        description: "The category has been deleted.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("quantity", e.target.value);
  };

  return (
    <div>
      <div className="p-4 bg-[#f5f5f5] rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col space-y-4">
              <div className="pt-4">
                <h1 className="font-bold text-2xl">Add a review</h1>
              </div>

              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-x-2">
                          <ReactStars
                            count={5}
                            size={40}
                            color="#e2dfdf"
                            activeColor="#FFD804"
                            value={field.value}
                            onChange={field.onChange}
                            isHalf
                            edit={true}
                          />

                          <span>
                            ({form.getValues().rating.toFixed(1)}) out of 5.0
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="w-full flex flex-wrap gap-4">
                  <div className="w-full sm:w-fit">
                    <FormField
                      control={form.control}
                      name="variantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              name={field.name}
                              value={field.value}
                              onChange={field.onChange}
                              options={variants}
                              placeholder="Select product"
                              subPlaceholder="Please select a product"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Select
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            options={sizes}
                            placeholder="Select size"
                            subPlaceholder="Please select a size"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            name="quantity"
                            type="number"
                            placeholder="Quantity (Optional)"
                            onChange={handleInputChange}
                            value={field.value ? field.value.toString() : ""} // Handle undefined gracefully
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="min-h-32 mt-2 p-4 w-full rounded-xl focus:outline-none ring-1 ring-[transparent] focus:ring-[#11BE86]"
                          placeholder="Write your review..."
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 text-destructive">
                {errors.rating && <p>{errors.rating.message}</p>}
                {errors.size && <p>{errors.size.message}</p>}
                {errors.review && <p>{errors.review.message}</p>}
              </div>

              <div className="w-full flex justify-end">
                <Button type="submit" className="w-36 h-12">
                  {isLoading ? (
                    <PulseLoader size={5} color="#fff" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductFormSchema } from "@/lib/schemas";
import { ProductWithVariantType } from "@/lib/types";
import { getSubCategoriesForCategory } from "@/queries/subCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, SubCategory } from "@prisma/client";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ImageUpload from "../shared/image-upload";
import ImagesPreviewGrid from "../shared/images-preview-grid";
import ClickToAddInputs from "./click-to-add";
import InputFieldset from "../shared/input-fieldset";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateRandomSKU } from "@/lib/utils";
import { WithOutContext as ReactTags } from "react-tag-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { upsertProduct } from "@/queries/product";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";

// React date time picker
import { format } from "date-fns";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { Dot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import JoditEditor from "jodit-react";
import { useTheme } from "next-themes";

interface ProductDetailsProps {
  data?: Partial<ProductWithVariantType>;
  categories: Category[];
  storeUrl: string;
}

export default function ProductDetails({
  data,
  categories,
  storeUrl,
}: ProductDetailsProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Jodit editor refs
  const productDescEditor = useRef(null);
  const variantDescEditor = useRef(null);

  // Jodit configration
  const { theme } = useTheme();

  const config = useMemo(
    () => ({
      theme: theme === "dark" ? "dark" : "default",
    }),
    [theme]
  );

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [images, setImages] = useState<{ url: string }[]>([]);
  const [colors, setColors] = useState<{ color: string }[]>(
    data?.colors || [{ color: "" }]
  );
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount: number }[]
  >(data?.sizes || [{ size: "", price: 0, quantity: 0, discount: 0 }]);

  // Handle keywords input
  const [keywords, setKeywords] = useState<string[]>(data?.keywords || []);

  interface Keyword {
    id: string;
    text: string;
  }

  const handleAddition = (keyword: Keyword) => {
    if (keywords.length === 10) return;
    setKeywords([...keywords, keyword.text]);
  };

  const handleDeleteKeyword = (i: number) => {
    setKeywords(keywords.filter((_, index) => index !== i));
  };

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: data?.name,
      description: data?.description,
      variantName: data?.variantName,
      variantDescription: data?.variantDescription,
      images: data?.images || [],
      variantImage: data?.variantImage ? [{ url: data.variantImage }] : [],
      categoryId: data?.categoryId,
      subCategoryId: data?.subCategoryId,
      brand: data?.brand,
      sku: data?.sku || generateRandomSKU(),
      colors: data?.colors || [{ color: "" }],
      sizes: data?.sizes,
      keywords: data?.keywords,
      isSale: data?.isSale,
      saleEndDate:
        data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    },
  });

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        variantImage: data.variantImage ? [{ url: data.variantImage }] : [],
      });
    }
  }, [data, form]);

  // get subCategories when user pick/change a category
  useEffect(() => {
    const getSubCategories = async () => {
      const res = await getSubCategoriesForCategory(form.watch().categoryId);
      setSubCategories(res);
    };

    getSubCategories();
  }, [form]);

  // Whenever colors, sizes, keywords changes we update the form values
  useEffect(() => {
    form.setValue("colors", colors);
    form.setValue("sizes", sizes);
    form.setValue("keywords", keywords);
  }, [colors, sizes, keywords, form]);

  // extract errors and loading states from form
  const errors = form.formState.errors;
  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof ProductFormSchema>) => {
    try {
      await upsertProduct(
        {
          productId: data?.productId ? data.productId : v4(),
          variantId: data?.variantId ? data.variantId : v4(),
          name: values.name,
          description: values.description,
          variantName: values.variantName,
          variantDescription: values.variantDescription || "",
          images: values.images,
          variantImage: values.variantImage[0].url,
          categoryId: values.categoryId,
          subCategoryId: values.subCategoryId,
          isSale: values.isSale,
          brand: values.brand,
          sku: values.sku,
          colors: values.colors,
          sizes: values.sizes,
          keywords: values.keywords,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        storeUrl
      );

      toast({
        title:
          data?.productId && data?.variantId
            ? "Product has been updated."
            : `Congratulations! product is now created.`,
      });

      if (data?.productId && data?.variantId) {
        router.refresh();
      } else {
        router.push(`/dashboard/seller/stores/${storeUrl}/products`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error.toString(),
      });
    }
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {data?.productId && data.variantId
              ? `Update ${data?.name} product information.`
              : " Lets create a product. You can edit product later from the product page."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Images - colors */}
              <div className="flex flex-col gap-y-6 xl:flex-row">
                {/* Images */}
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem className="w-full xl:border-r">
                      <FormControl>
                        <>
                          <ImagesPreviewGrid
                            images={form.getValues().images}
                            onRemove={(url) => {
                              const updatedImages = images.filter(
                                (img) => img.url !== url
                              );
                              setImages(updatedImages);
                              field.onChange(updatedImages);
                            }}
                            colors={colors}
                            setColors={setColors}
                          />

                          <FormMessage className="!mt-4" />

                          <ImageUpload
                            dontShowPreview
                            type="standard"
                            value={field.value.map((image) => image.url)}
                            disabled={isLoading}
                            onChange={(url) =>
                              setImages((prevImages) => {
                                const newImages = [...prevImages, { url }];
                                field.onChange(newImages);
                                return newImages;
                              })
                            }
                            onRemove={(url) =>
                              field.value.filter((image) => image.url !== url)
                            }
                          />
                        </>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* colors */}
                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                  <ClickToAddInputs
                    details={colors}
                    setDetails={setColors}
                    initialDetail={{ color: "" }}
                    header="Colors"
                    colorPicker
                  />

                  {errors.colors && (
                    <span className="text-sm font-medium text-destructive">
                      {errors.colors.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <InputFieldset label="Name">
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="variantName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variant name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>

              {/* Descriptions  */}
              <InputFieldset label="Description">
                <Tabs defaultValue="product" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="product">
                      Product description
                    </TabsTrigger>
                    <TabsTrigger value="variant">
                      Variant description
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="product">
                    <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <JoditEditor
                              ref={productDescEditor}
                              value={form.getValues().description}
                              onChange={(content) => {
                                form.setValue("description", content);
                              }}
                              config={config}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="variant">
                    <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="variantDescription"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <JoditEditor
                              ref={variantDescEditor}
                              value={form.getValues().variantDescription}
                              onChange={(content) => {
                                form.setValue("description", content);
                              }}
                              config={config}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </InputFieldset>

              {/* Category - SubCategory */}
              <InputFieldset label="Category">
                <div className="flex gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product Category</FormLabel>
                        <Select
                          disabled={isLoading || categories.length == 0}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Select a category"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch().categoryId && (
                    <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="subCategoryId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Product SubCategory</FormLabel>
                          <Select
                            disabled={isLoading || categories.length == 0}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  defaultValue={field.value}
                                  placeholder="Select a category"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subCategories.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </InputFieldset>

              {/* Brand, SKU */}
              <InputFieldset label="Brand, Sku">
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Product sku</FormLabel>
                        <FormControl>
                          <Input placeholder="Sku" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>

              {/* Sizes*/}
              <InputFieldset label="Sizes,  Quantities,  Prices,  Discounts">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputs
                    details={sizes}
                    setDetails={setSizes}
                    initialDetail={{
                      size: "",
                      quantity: 1,
                      price: 0.01,
                      discount: 0,
                    }}
                  />

                  {errors.sizes && (
                    <span className="text-sm font-medium text-destructive">
                      {errors.sizes.message}
                    </span>
                  )}
                </div>
              </InputFieldset>

              {/* Variant image - Keywords*/}
              <div className="flex items-center gap-10 py-14">
                {/* Variant image */}
                <div className="border-r pr-10">
                  <FormField
                    control={form.control}
                    name="variantImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="ml-14">Variant Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            dontShowPreview
                            type="profile"
                            value={field.value.map((image) => image.url)}
                            disabled={isLoading}
                            onChange={(url) => field.onChange([{ url }])}
                            onRemove={(url) =>
                              field.onChange([
                                ...field.value.filter(
                                  (current) => current.url !== url
                                ),
                              ])
                            }
                          />
                        </FormControl>
                        <FormMessage className="!mt-4" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Keywords */}
                <div className="w-full flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem className="relative flex-1">
                        <FormLabel>Product Keywords</FormLabel>
                        <FormControl>
                          <ReactTags
                            handleAddition={handleAddition}
                            handleDelete={() => {}}
                            placeholder="Keywords (e.g., winter jacket, warm, stylish)"
                            classNames={{
                              tagInputField:
                                "bg-background border rounded-md p-2 w-full focus:outline-none",
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((k, i) => (
                      <div
                        key={i}
                        className="text-xs inline-flex items-center px-3 py-1 bg-blue-200 text-blue-700 rounded-full gap-x-2"
                      >
                        <span>{k}</span>
                        <span
                          className="cursor-pointer"
                          onClick={() => handleDeleteKeyword(i)}
                        >
                          x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Is On Sale */}
              <InputFieldset
                label="Sale"
                description="Is your product on sale ?"
              >
                <div>
                  <label
                    htmlFor="yes"
                    className="ml-5 flex items-center gap-x-2 cursor-pointer"
                  >
                    <FormField
                      control={form.control}
                      name="isSale"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <>
                              <input
                                type="checkbox"
                                id="yes"
                                checked={field.value}
                                onChange={field.onChange}
                                hidden
                              />
                              <Checkbox
                                checked={field.value}
                                // @ts-ignore
                                onCheckedChange={field.onChange}
                              />
                            </>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span>Yes</span>
                  </label>

                  {form.getValues().isSale && (
                    <div className="mt5">
                      <p className="text-sm text-main-secondary dark:text-gray-400 pb-3 flex">
                        <Dot className="-me-1" />
                        When sale does end ?
                      </p>

                      <div className="flex items-center gap-x-5">
                        <FormField
                          control={form.control}
                          name="saleEndDate"
                          render={({ field }) => (
                            <FormItem className="ml-4">
                              <FormControl>
                                <DateTimePicker
                                  className="inline-flex items-center gap-2 p-2 border rounded-md shadow-sm"
                                  onChange={(date) => {
                                    field.onChange(
                                      date
                                        ? format(date, "yyyy-MM-dd'T'HH:mm:ss")
                                        : ""
                                    );
                                  }}
                                  value={
                                    field.value ? new Date(field.value) : null
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </InputFieldset>

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "loading..."
                  : data?.productId && data.variantId
                  ? "Save product information"
                  : "Create product"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
}

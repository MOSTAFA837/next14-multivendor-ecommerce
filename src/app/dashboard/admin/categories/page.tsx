import { Plus } from "lucide-react";

import CategoryDetails from "@/components/dashboard/forms/category-details";
import DataTable from "@/components/ui/data-table";
import { getAllCategories } from "@/queries/category";
import { columns } from "./columns";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  if (!categories) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create category
        </>
      }
      modalChildren={<CategoryDetails />}
      filterValue="name"
      data={categories}
      searchPlaceholder="Search categories..."
      columns={columns}
      newTabLink="/dashboard/admin/categories/new"
    />
  );
}

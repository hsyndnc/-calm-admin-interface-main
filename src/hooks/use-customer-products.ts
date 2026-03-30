import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";
import type { Product } from "@/hooks/use-products";

export interface Category {
  categoryId: number;
  categoryName: string;
}

const normalizePagedResult = (data: unknown): PagedResult<Product> => {
  if (Array.isArray(data)) {
    return {
      items: data,
      pageNumber: 1,
      pageSize: (data as unknown[]).length,
      totalCount: (data as unknown[]).length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
  const d = data as Record<string, unknown>;
  const result = d.$values ? { ...d, items: d.$values } : d;
  if ((result as Record<string, unknown>).items && ((result as Record<string, unknown>).items as Record<string, unknown>).$values) {
    (result as Record<string, unknown>).items = ((result as Record<string, unknown>).items as Record<string, unknown>).$values;
  }
  return result as PagedResult<Product>;
};

export const useCustomerProducts = (
  pageNumber: number,
  pageSize: number,
  categoryId?: number,
  search?: string,
) => {
  return useQuery<PagedResult<Product>>({
    queryKey: ["customer-products", pageNumber, pageSize, categoryId, search],
    queryFn: async () => {
      const params: Record<string, unknown> = { pageNumber, pageSize };
      if (categoryId) params.categoryId = categoryId;
      if (search?.trim()) params.search = search.trim();
      const { data } = await apiClient.get("api/products", { params });
      return normalizePagedResult(data);
    },
    placeholderData: keepPreviousData,
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("api/categories");
      if (Array.isArray(data)) return data;
      if (data?.$values) return data.$values;
      return [];
    },
  });
};

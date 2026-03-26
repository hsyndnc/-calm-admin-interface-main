import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";

export interface Product {
  productId: number;
  productName: string;
  categoryName?: string;
  quantityPerUnit?: string;
  unitPrice: number;
  unitsInStock: number;
  unitsOnOrder: number;
  reorderLevel: number;
  discontinued: boolean;
  categoryId?: number;
  supplierId?: number;
}

export type ProductPayload = Omit<Product, "productId" | "categoryName">;

const fetchProducts = async (
  pageNumber: number,
  pageSize: number,
): Promise<PagedResult<Product>> => {
  const { data } = await apiClient.get("api/products", {
    params: { pageNumber, pageSize },
  });

  if (Array.isArray(data)) {
    return {
      items: data,
      pageNumber: 1,
      pageSize: data.length,
      totalCount: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const result = data.$values ? { ...data, items: data.$values } : data;
  if (result.items?.$values) result.items = result.items.$values;

  return result;
};

export const useProducts = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["products", pageNumber, pageSize],
    queryFn: () => fetchProducts(pageNumber, pageSize),
    placeholderData: keepPreviousData,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => {
      const body = {
        productName: payload.productName,
        quantityPerUnit: payload.quantityPerUnit || "",
        unitPrice: Number(payload.unitPrice) || 0,
        unitsInStock: Number(payload.unitsInStock) || 0,
        unitsOnOrder: Number(payload.unitsOnOrder) || 0,
        reorderLevel: Number(payload.reorderLevel) || 0,
        discontinued: payload.discontinued ? 1 : 0,
        categoryId: Number(payload.categoryId) || 0,
        supplierId: Number(payload.supplierId) || 0,
      };
      return apiClient.post("api/products", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      original,
      payload,
    }: {
      original: Product;
      payload: ProductPayload;
    }) => {
      const body = {
        productId: original.productId,
        productName: payload.productName,
        quantityPerUnit: payload.quantityPerUnit || original.quantityPerUnit || "",
        unitPrice: Number(payload.unitPrice) || 0,
        unitsInStock: Number(payload.unitsInStock) || 0,
        unitsOnOrder: Number(payload.unitsOnOrder) || Number(original.unitsOnOrder) || 0,
        reorderLevel: Number(payload.reorderLevel) || Number(original.reorderLevel) || 0,
        discontinued: payload.discontinued ? 1 : 0,
        categoryId: Number(payload.categoryId) || Number(original.categoryId) || 0,
        supplierId: Number(payload.supplierId) || Number(original.supplierId) || 0,
      };
      return apiClient.put(`api/products/${original.productId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Product {
  productId: number;
  productName: string;
  unitPrice: number;
  unitsInStock: number;
  categoryId?: number;
  categoryName?: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get("products");
  return Array.isArray(data) ? data : data.$values ?? data.data ?? [];
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};

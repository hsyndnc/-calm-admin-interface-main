import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";

export interface Customer {
  customerId: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

export type CustomerPayload = Omit<Customer, "customerId">;

const fetchCustomers = async (
  pageNumber: number,
  pageSize: number,
): Promise<PagedResult<Customer>> => {
  const { data } = await apiClient.get("api/customers", {
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

export const useCustomers = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["customers", pageNumber, pageSize],
    queryFn: () => fetchCustomers(pageNumber, pageSize),
    placeholderData: keepPreviousData,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerPayload) =>
      apiClient.post("api/customers", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      original,
      payload,
    }: {
      original: Customer;
      payload: CustomerPayload;
    }) =>
      apiClient.put(`api/customers/${original.customerId}`, {
        ...original,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

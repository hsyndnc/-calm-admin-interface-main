import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Customer {
  customerId: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  phone: string;
  city: string;
  country: string;
}

const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await apiClient.get("customers");
  return Array.isArray(data) ? data : data.$values ?? data.data ?? [];
};

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
};

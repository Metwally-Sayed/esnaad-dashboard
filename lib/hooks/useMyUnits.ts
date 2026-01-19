import useSWR from 'swr';
import { api } from '@/lib/api/axios-config';

export interface MyUnit {
  id: string;
  unitNumber: string;
  buildingName?: string;
  floor?: number;
  area?: number;
  project?: {
    id: string;
    name: string;
  };
}

export function useMyUnits() {
  const { data, error, isLoading, mutate } = useSWR<MyUnit[]>(
    '/units/my-units',
    async (url: string) => {
      const response = await api.get(url);
      return response.data.data || [];
    }
  );

  return {
    units: data || [],
    isLoading,
    error,
    mutate,
  };
}

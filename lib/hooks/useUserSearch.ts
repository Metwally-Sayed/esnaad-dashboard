import { useState, useCallback } from 'react';
import { api } from '@/lib/api/axios-config';

export interface SearchUser {
  id: string;
  name?: string;
  email: string;
  phone?: string;
}

export function useUserSearch() {
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (query: string, role?: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get('/users/search', {
        params: { q: query, role: role || 'OWNER' },
      });
      setResults(response.data.data || []);
    } catch (error) {
      console.error('User search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, isLoading, search, clearResults };
}

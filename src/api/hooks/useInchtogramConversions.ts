import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Conversion, Category } from '../entities/conversion';
import { supabase } from '../supabaseClient';

interface UseInchtogramConversionsOptions {
  /**
   * If provided, will only return conversions for the specified category
   * If undefined or empty string, returns all conversions
   */
  category?: Category | string;
  
  /**
   * If true, will include disabled conversions
   * @default false
   */
  includeDisabled?: boolean;
  
  /**
   * If true, will include conversions in both directions (A→B and B→A)
   * @default true
   */
  includeReverseConversions?: boolean;
  
  /**
   * If true, will subscribe to real-time updates
   * @default true
   */
  enableRealtime?: boolean;
}

/**
 * Hook to fetch and manage inchtogram conversions from the database
 * 
 * @example
 * // Basic usage
 * const { conversions, loading, error } = useInchtogramConversions();
 * 
 * // Filter by category
 * const { conversions: lengthConversions } = useInchtogramConversions({
 *   category: 'length'
 * });
 * 
 * // Include disabled conversions
 * const allConversions = useInchtogramConversions({
 *   includeDisabled: true
 * });
 */
export function useInchtogramConversions({
  category,
  includeDisabled = false,
  includeReverseConversions = true,
  enableRealtime = true,
}: UseInchtogramConversionsOptions = {}) {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchConversions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from('inchtogram_conversions')
        .select('*')
        .order('category', { ascending: true })
        .order('from_unit', { ascending: true });
      
      // Filter by category if provided
      if (category) {
        query = query.eq('category', category);
      }
      
      // Filter out disabled conversions unless explicitly included
      if (!includeDisabled) {
        query = query.eq('is_enabled', true);
      }
      
      const { data, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      // Process the data
      let processedData = data || [];
      
      // Add reverse conversions if needed
      if (includeReverseConversions) {
        const reverseConversions = processedData.map(conv => ({
          ...conv,
          id: `${conv.id}_reverse`,
          from_unit: conv.to_unit,
          to_unit: conv.from_unit,
          factor: 1 / conv.factor,
          is_reverse: true,
          original_id: conv.id,
        }));
        
        processedData = [...processedData, ...reverseConversions];
      }
      
      setConversions(processedData);
      setError(null);
      setLastRefreshed(new Date());
      return processedData;
    } catch (err) {
      console.error('Error fetching conversions:', err);
      const error = err instanceof Error ? err : new Error('Failed to fetch conversions');
      setError(error);
      setConversions([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [category, includeDisabled, includeReverseConversions]);

  // Initial data fetch
  useEffect(() => {
    fetchConversions().catch(console.error);
  }, [fetchConversions]);
  
  // Set up real-time subscription for changes
  useEffect(() => {
    if (!enableRealtime) return;
    
    const subscription = supabase
      .channel('inchtogram_conversions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inchtogram_conversions',
      }, (payload) => {
        console.log('Change received!', payload);
        fetchConversions().catch(console.error);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime, fetchConversions]);
  
  // Memoized computed values
  const { conversionsByCategory, categories, allUnits } = useMemo(() => {
    // Group conversions by category for UI display
    const byCategory = conversions.reduce<Record<string, Conversion[]>>((acc, conv) => {
      if (!acc[conv.category]) {
        acc[conv.category] = [];
      }
      acc[conv.category].push(conv);
      return acc;
    }, {});
    
    // Get all unique categories
    const cats = Object.keys(byCategory).sort();
    
    // Get all unique units
    const units = new Set<string>();
    conversions.forEach(conv => {
      units.add(conv.from_unit);
      units.add(conv.to_unit);
    });
    
    return {
      conversionsByCategory: byCategory,
      categories: cats,
      allUnits: Array.from(units).sort(),
    };
  }, [conversions]);

  /**
   * Get all conversions for a specific unit
   */
  const getConversionsForUnit = useCallback((unit: string): Conversion[] => {
    return conversions.filter(
      conv => conv.from_unit === unit || conv.to_unit === unit
    );
  }, [conversions]);
  
  /**
   * Find a conversion between two units, if it exists
   */
  const findConversion = useCallback((fromUnit: string, toUnit: string): Conversion | undefined => {
    return conversions.find(
      conv => conv.from_unit === fromUnit && conv.to_unit === toUnit
    );
  }, [conversions]);

  return {
    /**
     * All conversions as a flat array
     */
    conversions,
    
    /**
     * Conversions grouped by category
     */
    conversionsByCategory,
    
    /**
     * List of all unique categories
     */
    categories,
    
    /**
     * List of all unique units
     */
    allUnits,
    
    /**
     * Loading state
     */
    loading,
    
    /**
     * Error state, if any
     */
    error,
    
    /**
     * Timestamp of the last successful refresh
     */
    lastRefreshed,
    
    /**
     * Get all conversions for a specific unit
     */
    getConversionsForUnit,
    
    /**
     * Find a specific conversion between two units
     */
    findConversion,
    
    /**
     * Refresh the data
     */
    refresh: fetchConversions,
  };
}

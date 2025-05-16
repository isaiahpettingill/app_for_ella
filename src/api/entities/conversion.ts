/**
 * Base conversion interface that matches the database schema
 */
export interface Conversion {
  /** Unique identifier */
  id: string;
  
  /** The unit to convert from */
  from_unit: string;
  
  /** The unit to convert to */
  to_unit: string;
  
  /** The conversion factor (1 from_unit = factor to_unit) */
  factor: number;
  
  /** Category for grouping (e.g., 'length', 'weight') */
  category: string;
  
  /** Whether this conversion is enabled */
  is_enabled: boolean;
  
  /** When this conversion was created */
  created_at: string;
  
  /** When this conversion was last updated */
  updated_at?: string;
  
  /** Optional description of the conversion */
  description?: string;
  
  /** Optional notes about the conversion */
  notes?: string;
}

/**
 * Extended conversion type that includes the input value and result
 */
export interface ConversionWithResult extends Omit<Conversion, 'factor'> {
  /** The input value to convert */
  value: number;
  
  /** The calculated result (value * factor) */
  result?: number;
  
  /** The conversion factor used */
  factor: number;
}

/**
 * Represents a path between two units with the total conversion factor
 */
export interface ConversionPath {
  /** The sequence of units in the conversion path */
  path: string[];
  
  /** The total conversion factor along the path */
  factor: number;
}

/**
 * Common unit categories for grouping conversions
 */
export const CATEGORIES = [
  'length',
  'weight',
  'mass',
  'volume',
  'temperature',
  'area',
  'speed',
  'time',
  'digital',
  'cooking',
  'pressure',
  'energy',
  'power',
  'force',
  'angle',
  'data',
  'data-transfer',
  'frequency',
  'illuminance',
  'luminance',
  'luminous-flux',
  'luminous-intensity',
  'magnetic-flux',
  'magnetic-flux-density',
  'radiation',
  'radiation-absorbed-dose',
  'radiation-equivalent-dose',
  'radioactivity',
  'voltage',
  'current',
  'capacitance',
  'resistance',
  'conductance',
  'magnetic-inductance',
  'inductance',
  'electric-charge',
  'electric-potential',
  'illuminance',
  'luminance',
  'luminous-flux',
  'luminous-intensity',
  'magnetic-flux',
  'magnetic-flux-density',
  'radiation',
  'radiation-absorbed-dose',
  'radiation-equivalent-dose',
  'radioactivity',
  'voltage',
  'current',
  'capacitance',
  'resistance',
  'conductance',
  'magnetic-inductance',
  'inductance',
  'electric-charge',
  'electric-potential',
  'other',
] as const;

/**
 * Type representing valid unit categories
 */
export type Category = typeof CATEGORIES[number];

/**
 * Builds a conversion graph from a list of conversions
 */
export function buildConversionGraph(conversions: Conversion[]) {
  const graph: Record<string, Record<string, number>> = {};
  
  // Add all direct conversions
  for (const conv of conversions) {
    if (!graph[conv.from_unit]) {
      graph[conv.from_unit] = {};
    }
    if (!graph[conv.to_unit]) {
      graph[conv.to_unit] = {};
    }
    
    // Add forward conversion
    graph[conv.from_unit][conv.to_unit] = conv.factor;
    // Add reverse conversion
    graph[conv.to_unit][conv.from_unit] = 1 / conv.factor;
  }
  
  return graph;
}

/**
 * Finds all possible conversion paths between two units using BFS
 */
export function findConversionPaths(
  graph: Record<string, Record<string, number>>,
  fromUnit: string,
  toUnit: string,
  maxDepth = 3
): ConversionPath[] {
  if (!graph[fromUnit] || !graph[toUnit]) {
    return [];
  }
  
  // Check for direct conversion
  if (graph[fromUnit][toUnit]) {
    return [{
      path: [fromUnit, toUnit],
      factor: graph[fromUnit][toUnit]
    }];
  }
  
  const paths: ConversionPath[] = [];
  const queue: { path: string[]; factor: number }[] = [
    { path: [fromUnit], factor: 1 }
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const lastUnit = current.path[current.path.length - 1];
    
    // Skip if we've gone too deep
    if (current.path.length > maxDepth) continue;
    
    // Check all neighbors
    for (const [neighbor, factor] of Object.entries(graph[lastUnit])) {
      // Skip if we've already visited this unit in the current path
      if (current.path.includes(neighbor)) continue;
      
      const newPath = [...current.path, neighbor];
      const newFactor = current.factor * factor;
      
      // If we've reached the target, add the path
      if (neighbor === toUnit) {
        paths.push({
          path: newPath,
          factor: newFactor
        });
      } else {
        // Otherwise, continue exploring
        queue.push({
          path: newPath,
          factor: newFactor
        });
      }
    }
  }
  
  // Sort by path length (shortest first)
  return paths.sort((a, b) => a.path.length - b.path.length);
}

/**
 * Gets all units that can be converted from the given unit
 */
export function getConvertibleUnits(
  graph: Record<string, Record<string, number>>,
  fromUnit: string,
  maxDepth = 2
): string[] {
  if (!graph[fromUnit]) return [];
  
  const visited = new Set<string>([fromUnit]);
  const queue: { unit: string; depth: number }[] = 
    Object.keys(graph[fromUnit]).map(unit => ({ unit, depth: 1 }));
  const result = new Set<string>();
  
  while (queue.length > 0) {
    const { unit, depth } = queue.shift()!;
    
    if (visited.has(unit)) continue;
    visited.add(unit);
    
    result.add(unit);
    
    if (depth < maxDepth) {
      for (const neighbor of Object.keys(graph[unit] || {})) {
        if (!visited.has(neighbor)) {
          queue.push({ unit: neighbor, depth: depth + 1 });
        }
      }
    }
  }
  
  return Array.from(result).sort();
}

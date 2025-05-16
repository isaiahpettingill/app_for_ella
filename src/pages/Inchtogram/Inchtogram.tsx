import { useState, useMemo, useEffect } from 'react';
import { 
  Conversion,
  Category,
  CATEGORIES,
  buildConversionGraph, 
  findConversionPaths,
  getConvertibleUnits
} from '../../api/entities/conversion';
import { useInchtogramConversions } from '../../api/hooks/useInchtogramConversions';
import { UnitSelector } from '../../components/inchtogram/UnitSelector';
import styles from './Inchtogram.module.css';

// Special handling for temperature conversions
const convertTemperature = (value: number, fromUnit: string, toUnit: string): number => {
  let celsius: number;
  
  // Convert to Celsius first
  switch (fromUnit.toLowerCase()) {
    case 'fahrenheit':
      celsius = (value - 32) * 5/9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    case 'celsius':
    default:
      celsius = value;
  }
  
  // Convert from Celsius to target unit
  switch (toUnit.toLowerCase()) {
    case 'fahrenheit':
      return (celsius * 9/5) + 32;
    case 'kelvin':
      return celsius + 273.15;
    case 'celsius':
    default:
      return celsius;
  }
};

interface CategoryOption {
  value: Category;
  label: string;
  count: number;
}

export default function Inchtogram() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('length' as Category);
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [conversionPath, setConversionPath] = useState<string[]>([]);
  
  // Fetch conversions from Supabase
  const { 
    conversions, 
    loading, 
    error, 
    getConversionsForUnit 
  } = useInchtogramConversions({
    includeDisabled: false // Only show enabled conversions
  });

  // Build the conversion graph whenever conversions change
  const conversionGraph = useMemo(() => {
    return buildConversionGraph(conversions);
  }, [conversions]);

  // Handle loading and error states
  if (loading) return <div>Loading conversions...</div>;
  if (error) return <div>Error loading conversions: {error.message}</div>;

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get all available categories with their display names and counts
  const availableCategories = useMemo(() => {
    const categoryCounts = new Map<Category, number>();
    
    // Count units per category
    conversions.forEach(conv => {
      const category = conv.category as Category;
      const count = categoryCounts.get(category) || 0;
      categoryCounts.set(category, count + 1);
    });

    // Filter out categories with no conversions and sort
    return Array.from(categoryCounts.entries())
      .filter(([_, count]) => count > 0)
      .sort(([catA], [catB]) => catA.localeCompare(catB))
      .map(([category, count]) => ({
        value: category,
        label: formatCategoryName(category),
        count
      }));
  }, [conversions]);

  // Auto-select first category with conversions if current selection has none
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.some(cat => cat.value === selectedCategory)) {
      const firstCategory = availableCategories[0]?.value as Category || 'length';
      setSelectedCategory(firstCategory);
    }
  }, [availableCategories, selectedCategory]);

  // Get all available units for the current category
  const categoryUnits = useMemo(() => {
    const units = new Set<string>();
    conversions
      .filter(conv => conv.category === selectedCategory)
      .forEach(conv => {
        units.add(conv.from_unit);
        units.add(conv.to_unit);
      });
    return Array.from(units).sort();
  }, [conversions, selectedCategory]);

  // Get all units that can be converted to from the current fromUnit
  const toUnits = useMemo(() => {
    if (!fromUnit || !conversionGraph[fromUnit]) return [];
    
    // Get all reachable units within 3 steps
    const reachable = getConvertibleUnits(conversionGraph, fromUnit, 3);
    return reachable.filter(unit => unit !== fromUnit);
  }, [fromUnit, conversionGraph]);



  // Auto-convert when inputs change
  useEffect(() => {
    if (!fromUnit || !toUnit || !value) {
      setResult(null);
      setConversionPath([]);
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setResult(null);
      setConversionPath([]);
      return;
    }

    // Special handling for temperature
    if (selectedCategory === 'temperature') {
      const converted = convertTemperature(numValue, fromUnit, toUnit);
      setResult(converted);
      setConversionPath([fromUnit, toUnit]);
      return;
    }
    
    // Find conversion path using the graph
    const paths = findConversionPaths(conversionGraph, fromUnit, toUnit, 3);
    
    if (paths.length > 0) {
      const bestPath = paths[0]; // Get the shortest path
      const convertedValue = numValue * bestPath.factor;
      setResult(convertedValue);
      setConversionPath(bestPath.path);
    } else {
      setResult(null);
      setConversionPath([]);
    }
  }, [fromUnit, toUnit, value, selectedCategory, conversionGraph]);

  const handleCategoryChange = (newCategory: Category) => {
    setSelectedCategory(newCategory);
    setFromUnit('');
    setToUnit('');
    setValue('');
    setResult(null);
    setConversionPath([]);
  };
  
  const handleFromUnitChange = (unit: string) => {
    // If the new fromUnit is the same as the current toUnit, swap them
    if (unit === toUnit) {
      setFromUnit(toUnit);
      setToUnit(fromUnit);
    } else {
      setFromUnit(unit);
    }
    // Clear the result since we're changing units
    setResult(null);
    setConversionPath([]);
  };

  const handleToUnitChange = (unit: string) => {
    // If the new toUnit is the same as the current fromUnit, swap them
    if (unit === fromUnit) {
      setToUnit(fromUnit);
      setFromUnit(toUnit);
    } else {
      setToUnit(unit);
    }
    // Clear the result since we're changing units
    setResult(null);
    setConversionPath([]);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue((e.target as HTMLInputElement).value);
  };

  // Format the conversion path for display
  const formatConversionPath = (path: string[]): string => {
    if (path.length < 2) return '';
    
    const steps = [];
    for (let i = 0; i < path.length - 1; i++) {
      steps.push(`${path[i]} → ${path[i + 1]}`);
    }
    
    return steps.join(' → ');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Inchtogram</h1>
        
        <div className={styles.categoryDropdown}>
          <select
            className={styles.categorySelect}
            value={selectedCategory}
            onChange={(e) => {
              const target = e.target as HTMLSelectElement;
              handleCategoryChange(target.value as Category);
            }}
          >
            {availableCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label} ({category.count} units)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.converter}>
          <div className={styles.inputGroup}>
            <input
              type="number"
              className={styles.input}
              value={value}
              onChange={handleValueChange}
              placeholder="Enter value"
              inputMode="decimal"
            />
            
            <UnitSelector
              value={fromUnit}
              onChange={handleFromUnitChange}
              units={categoryUnits}
              label="From"
            />
            
            <UnitSelector
              value={toUnit}
              onChange={handleToUnitChange}
              units={toUnits}
              label="To"
              disabled={!fromUnit}
            />
            
            {result !== null && (
              <div className={styles.result}>
                <h3>Result:</h3>
                <p className={styles.resultValue}>
                  {parseFloat(value)} {fromUnit} = {result.toFixed(4)} {toUnit}
                </p>
                
                {conversionPath.length > 2 && (
                  <div className={styles.conversionPath}>
                    <div className={styles.pathLabel}>Conversion path:</div>
                    <div className={styles.pathSteps}>
                      {formatConversionPath(conversionPath)}
                    </div>
                  </div>
                )}
                
                {selectedCategory === 'temperature' && (
                  <div className={styles.note}>
                    Note: Temperature conversions use a direct formula
                  </div>
                )}
              </div>
            )}
            
            {result === null && fromUnit && toUnit && (
              <div className={styles.error}>
                No conversion path found between {fromUnit} and {toUnit}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

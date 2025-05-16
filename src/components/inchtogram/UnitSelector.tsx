import { Conversion, Category } from '@/api/entities/conversion';
import { JSX } from 'preact';
import styles from './UnitSelector.module.css';

interface UnitSelectorProps {
  value: string;
  onChange: (unit: string) => void;
  units: string[];
  label: string;
  disabled?: boolean;
}

export function UnitSelector({ value, onChange, units, label, disabled = false }: UnitSelectorProps) {
  return (
    <div className={styles.unitSelector}>
      <label className={styles.label}>{label}</label>
      <select 
        className={styles.select}
        value={value}
        onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => onChange(e.currentTarget.value)}
        disabled={disabled}
      >
        <option value="">Select a unit</option>
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>
  );
}

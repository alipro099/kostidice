import { CSSProperties } from 'react';
import styles from './Tabs.module.css';

export interface TabOption<T extends string> {
  label: string;
  value: T;
}

export interface TabsProps<T extends string> {
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ value, options, onChange }: TabsProps<T>) {
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  const pillStyle: CSSProperties = {
    width: `${100 / options.length}%`,
    transform: `translateX(${activeIndex * 100}%)`,
  };

  return (
    <div className={styles.tabs} role="tablist">
      <div className={styles.pill} style={pillStyle} aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          className={`${styles.option} ${option.value === value ? styles.active : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

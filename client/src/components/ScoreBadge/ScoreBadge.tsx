import styles from './ScoreBadge.module.css';

export interface ScoreBadgeProps {
  label: string;
  value: number | string;
}

export function ScoreBadge({ label, value }: ScoreBadgeProps) {
  return (
    <div className={styles.badge}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

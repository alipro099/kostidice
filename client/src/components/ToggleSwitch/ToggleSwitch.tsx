import styles from './ToggleSwitch.module.css';

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className={styles.switch}>
      <span className={`${styles.track} ${checked ? styles.trackActive : ''}`}>
        <span className={`${styles.thumb} ${checked ? styles.thumbActive : ''}`} />
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ display: 'none' }}
      />
      <span className={styles.label}>{label}</span>
    </label>
  );
}

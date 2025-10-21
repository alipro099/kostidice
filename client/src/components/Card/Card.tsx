import { KeyboardEvent, PropsWithChildren } from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

export interface CardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  accent?: string;
  onClick?: () => void;
}

export function Card({ title, subtitle, accent, children, onClick }: CardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={clsx(styles.card, { [styles.clickable]: Boolean(onClick) })}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{title}</div>
          {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
        </div>
        {accent ? <div className={styles.accent}>{accent}</div> : null}
      </div>
      <div className={styles.content}>{children}</div>
      <span className={styles.wave} aria-hidden="true" />
    </article>
  );
}

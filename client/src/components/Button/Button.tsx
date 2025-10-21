import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', block = false, className, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        styles.button,
        styles[variant],
        size === 'lg' ? styles.sizeLg : styles.sizeMd,
        { [styles.block]: block },
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

import Link from 'next/link';
import type { MouseEventHandler } from 'react';

type AnimatedButtonProps = {
  href: string;
  label: string;
  mobileLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function RollingLabel({ children, className }: { children: string; className: string }) {
  return <span className={`button-copy ${className}`}><span className="button-label-mask"><span className="button-label button-label-primary">{children}</span><span className="button-label button-label-secondary" aria-hidden="true">{children}</span></span></span>;
}

export function AnimatedButton({ href, label, mobileLabel = label, onClick }: AnimatedButtonProps) {
  return <Link className="button animated-button" href={href} onClick={onClick}><RollingLabel className="desktop-label">{label}</RollingLabel><RollingLabel className="mobile-label">{mobileLabel}</RollingLabel></Link>;
}

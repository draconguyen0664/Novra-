import Link from 'next/link';
import type { MouseEventHandler } from 'react';

type AnimatedNavLinkProps = {
  href: string;
  label: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function AnimatedNavLink({ href, label, active = false, onClick }: AnimatedNavLinkProps) {
  return (
    <Link
      className={`nav-link${active ? ' is-active' : ''}`}
      href={href}
      aria-current={active ? 'location' : undefined}
      onClick={onClick}
    >
      <span className="nav-mask">
        <span className="nav-track">
          <span className="nav-text nav-text-primary">{label}</span>
          <span className="nav-text nav-text-secondary" aria-hidden="true">{label}</span>
        </span>
      </span>
    </Link>
  );
}

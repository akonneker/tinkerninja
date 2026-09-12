import type { ComponentProps } from 'react';
import { atlasHref } from '@/lib/site-path';

// Keep page navigation native: the hosted client router can swallow clicks
// before requesting the destination. Document navigation also works without JS.
export function PageLink({
  href,
  children,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { href: string }) {
  return (
    <a href={atlasHref(href)} {...props}>
      {children}
    </a>
  );
}

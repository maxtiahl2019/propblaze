import React from 'react';
export function generateStaticParams() {
  return [{ id: 'demo-1' }, { id: 'demo-2' }, { id: 'demo-3' }];
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

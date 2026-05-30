'use client';

import Link from 'next/link';
import { DestockGo2Shell } from './DestockGo2Shell';

export function DestockComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <DestockGo2Shell title={title}>
      <div className="go2-panel" style={{ maxWidth: 420, margin: '40px auto' }}>
        <div className="go2-panel-head">{title}</div>
        <div className="go2-panel-body" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#a8a29e', lineHeight: 1.5 }}>{description}</p>
          <Link href="/destock" className="go2-btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>
            Volver al planeta
          </Link>
        </div>
      </div>
    </DestockGo2Shell>
  );
}

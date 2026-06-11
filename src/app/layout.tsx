import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from '@/components/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Éli — Ta plateforme éducative',
  description: 'Plateforme éducative : programmes National (Gabon) et AEFE. L\'intelligence au service de ta réussite.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

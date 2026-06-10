import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from '@/components/Providers';
import BougieProvider from '@/components/BougieProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Éli — L\'intelligence au service de ta réussite',
  description: 'Plateforme éducative : programmes National (Gabon) et AEFE.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#main">Aller au contenu</a>
        <Providers>
          <BougieProvider>
            <main id="main">{children}</main>
          </BougieProvider>
        </Providers>
      </body>
    </html>
  );
}

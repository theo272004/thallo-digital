import type { Metadata } from 'next';
import HomeArchive from '@/components/HomeArchive';

/**
 * /home-archive/ — the previous home page, kept for reuse. Mirror only: see the
 * note at the top of HomeArchive, and the step in deploy-bluehost.yml that
 * removes it from the live upload.
 */
export const metadata: Metadata = {
  title: 'Home archive',
  robots: { index: false, follow: false },
};

export default function HomeArchivePage() {
  return <HomeArchive />;
}

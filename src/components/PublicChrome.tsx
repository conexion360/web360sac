'use client';
import { usePathname } from 'next/navigation';
import NavBar from '@/components/NavBar';
import FooterSection from '@/components/FooterSection';

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <NavBar />
      <main>{children}</main>
      <FooterSection />
    </>
  );
}

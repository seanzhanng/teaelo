'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Vote' },
    { href: '/rankings', label: 'Rankings' },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none backdrop-blur-md"
      style={{ backgroundColor: 'rgba(235, 221, 208, 0.15)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="flex items-center justify-between h-20 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/teaelo.svg"
              alt="Teaelo Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-milk-tea-darker tracking-tight">
              TeaElo
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-5 py-2.5 text-base font-medium transition-colors rounded-lg
                    ${isActive
                      ? 'text-milk-tea-darker bg-milk-tea-medium/30'
                      : 'text-milk-tea-dark/70 hover:text-milk-tea-darker hover:bg-milk-tea-medium/20'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}


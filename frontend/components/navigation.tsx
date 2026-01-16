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
    <nav className="sticky top-10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/teaelo.svg"
              alt="Teaelo Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-milk-tea-darker tracking-tight">
              TeaElo
            </span>
          </Link>
          
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 text-sm font-medium transition-colors
                    ${isActive
                      ? 'text-milk-tea-darker bg-milk-tea-medium/30'
                      : 'text-milk-tea-dark/70 hover:text-milk-tea-darker hover:bg-milk-tea-medium/20'
                    }
                  `}
                  style={{
                    borderRadius: isActive ? '6px' : '6px',
                  }}
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


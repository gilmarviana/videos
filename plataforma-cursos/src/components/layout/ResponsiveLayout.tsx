'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    role: 'admin' | 'student';
  } | null;
  showNavigation?: boolean;
}

export function ResponsiveLayout({ 
  children, 
  user, 
  showNavigation = true 
}: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const navigationItems = user?.role === 'admin' ? [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/users', label: 'Usuários', icon: 'users' },
    { href: '/admin/subscriptions', label: 'Assinaturas', icon: 'subscriptions' },
    { href: '/admin/courses', label: 'Cursos', icon: 'courses' },
    { href: '/admin/whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
    { href: '/admin/webhooks', label: 'Webhooks', icon: 'webhooks' },
  ] : [
    { href: '/dashboard', label: 'Meus Cursos', icon: 'courses' },
    { href: '/courses', label: 'Explorar', icon: 'explore' },
    { href: '/learning-paths', label: 'Trilhas', icon: 'paths' },
    { href: '/certificates', label: 'Certificados', icon: 'certificates' },
    { href: '/profile', label: 'Perfil', icon: 'profile' },
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      dashboard: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      subscriptions: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      courses: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      whatsapp: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
        </svg>
      ),
      webhooks: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      explore: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      ),
      paths: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      certificates: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      profile: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
    };
    return icons[iconName as keyof typeof icons] || icons.dashboard;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && (
        <>
          {/* Desktop Navigation */}
          <nav className="bg-white shadow-sm border-b hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                      <h1 className="text-xl font-bold text-gray-900 cursor-pointer">
                        {user?.role === 'admin' ? 'Admin Dashboard' : 'Plataforma de Cursos'}
                      </h1>
                    </Link>
                  </div>
                  <div className="ml-6 flex space-x-8">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${
                          pathname === item.href
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                      >
                        {getIcon(item.icon)}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                {user && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Olá, {user.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <nav className="bg-white shadow-sm border-b md:hidden">
            <div className="px-4">
              <div className="flex justify-between items-center h-16">
                <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                  <h1 className="text-lg font-bold text-gray-900">
                    {user?.role === 'admin' ? 'Admin' : 'Cursos'}
                  </h1>
                </Link>
                
                <div className="flex items-center space-x-2">
                  {user && (
                    <span className="text-sm text-gray-700 hidden sm:block">
                      {user.name}
                    </span>
                  )}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
              <div className="border-t border-gray-200">
                <div className="pt-2 pb-3 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                      } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center space-x-3`}
                    >
                      {getIcon(item.icon)}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span>Sair</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </>
      )}

      {/* Main content */}
      <main className={`${showNavigation ? 'max-w-7xl mx-auto' : ''} py-4 px-4 sm:px-6 lg:px-8`}>
        {children}
      </main>
    </div>
  );
}
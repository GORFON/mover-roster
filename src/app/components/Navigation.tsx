'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  username: string;
  role: 'driver' | 'outsider';
  isAuthenticated: boolean;
}

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('timeEntries');
    localStorage.removeItem('shifts');
    localStorage.removeItem('jobs');
    router.push('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/jobs', label: 'Jobs', icon: '📋' },
  ];

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚛</span>
              <span className="text-xl font-bold text-gray-900">Mover Roster</span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-sm text-gray-600">
              <span className="font-medium">{user.username}</span>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {user.role}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t pt-4 pb-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div>{item.icon}</div>
                  <div className="text-xs">{item.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
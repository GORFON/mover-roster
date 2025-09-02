'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';

interface User {
  username: string;
  role: 'driver' | 'outsider';
  isAuthenticated: boolean;
  loginTime: string;
}

interface TimeEntry {
  id: string;
  type: 'clock-in' | 'clock-out';
  timestamp: string;
  location?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load time entries
    const entries = localStorage.getItem('timeEntries') || '[]';
    const parsedEntries = JSON.parse(entries);
    setTimeEntries(parsedEntries);

    // Check if currently clocked in
    const lastEntry = parsedEntries[parsedEntries.length - 1];
    setIsClockedIn(lastEntry?.type === 'clock-in');

    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleClockAction = () => {
    if (!user) return;

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      type: isClockedIn ? 'clock-out' : 'clock-in',
      timestamp: new Date().toISOString(),
      location: 'Office' // In a real app, this could be GPS location
    };

    const updatedEntries = [...timeEntries, newEntry];
    setTimeEntries(updatedEntries);
    localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    setIsClockedIn(!isClockedIn);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTodaysEntries = () => {
    const today = new Date().toDateString();
    return timeEntries.filter(entry => 
      new Date(entry.timestamp).toDateString() === today
    );
  };

  const calculateWorkedTime = () => {
    const todaysEntries = getTodaysEntries();
    let totalMinutes = 0;
    
    for (let i = 0; i < todaysEntries.length; i += 2) {
      const clockIn = todaysEntries[i];
      const clockOut = todaysEntries[i + 1];
      
      if (clockIn?.type === 'clock-in' && clockOut?.type === 'clock-out') {
        const start = new Date(clockIn.timestamp);
        const end = new Date(clockOut.timestamp);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      }
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">Role: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Time Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Time</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Clock In/Out Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h2>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                isClockedIn 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isClockedIn ? '● Clocked In' : '○ Clocked Out'}
              </div>
              <button
                onClick={handleClockAction}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isClockedIn
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>

          {/* Today's Hours Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Hours</h2>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {calculateWorkedTime()}
              </div>
              <div className="text-sm text-gray-600">
                Hours worked today
              </div>
            </div>
          </div>
        </div>

        {/* Recent Time Entries */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Entries</h2>
          <div className="space-y-3">
            {getTodaysEntries().slice(-6).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    entry.type === 'clock-in' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">
                    {entry.type === 'clock-in' ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {getTodaysEntries().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No time entries for today yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';

interface User {
  username: string;
  role: 'driver' | 'outsider';
  isAuthenticated: boolean;
}

interface Shift {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo: string;
  role: 'driver' | 'outsider';
  status: 'scheduled' | 'in-progress' | 'completed';
  description?: string;
}

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    assignedTo: '',
    role: 'driver' as 'driver' | 'outsider',
    description: ''
  });
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

    // Load shifts
    const shiftsData = localStorage.getItem('shifts');
    if (shiftsData) {
      setShifts(JSON.parse(shiftsData));
    } else {
      // Initialize with some sample shifts
      const sampleShifts: Shift[] = [
        {
          id: '1',
          title: 'Morning Delivery Route',
          date: new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '12:00',
          assignedTo: parsedUser.username,
          role: 'driver',
          status: 'scheduled',
          description: 'Deliver packages to downtown area'
        },
        {
          id: '2',
          title: 'Office Support',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          startTime: '09:00',
          endTime: '17:00',
          assignedTo: parsedUser.username,
          role: 'outsider',
          status: 'scheduled',
          description: 'Assist with administrative tasks'
        }
      ];
      setShifts(sampleShifts);
      localStorage.setItem('shifts', JSON.stringify(sampleShifts));
    }
  }, [router]);

  const getCurrentWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getShiftsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateString);
  };

  const handleAddShift = () => {
    if (!newShift.title || !newShift.date || !newShift.startTime || !newShift.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const shift: Shift = {
      id: Date.now().toString(),
      ...newShift,
      assignedTo: newShift.assignedTo || user?.username || '',
      status: 'scheduled'
    };

    const updatedShifts = [...shifts, shift];
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
    
    setNewShift({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      assignedTo: '',
      role: 'driver',
      description: ''
    });
    setShowAddShift(false);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const weekDates = getCurrentWeekDates();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Schedule</h1>
          <button
            onClick={() => setShowAddShift(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Shift
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            ← Previous Week
          </button>
          
          <div className="text-lg font-semibold text-gray-900">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
            {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Next Week →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white rounded-lg shadow-lg p-6">
          {weekDates.map((date, index) => {
            const dayShifts = getShiftsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className="min-h-[200px]">
                <div className={`text-center p-3 rounded-lg mb-4 ${
                  isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-700'
                }`}>
                  <div className="font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold">
                    {date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`p-3 rounded-lg text-sm ${
                        shift.role === 'driver' 
                          ? 'bg-green-100 border-l-4 border-green-500' 
                          : 'bg-blue-100 border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{shift.title}</div>
                      <div className="text-gray-600 text-xs">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-1 rounded-full ${
                          shift.role === 'driver' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                        }`}>
                          {shift.role}
                        </span>
                      </div>
                      {shift.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          {shift.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Shift Modal */}
        {showAddShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Shift</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Title *
                  </label>
                  <input
                    type="text"
                    value={newShift.title}
                    onChange={(e) => setNewShift({ ...newShift, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Morning Delivery Route"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newShift.role}
                    onChange={(e) => setNewShift({ ...newShift, role: e.target.value as 'driver' | 'outsider' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="driver">Driver</option>
                    <option value="outsider">Outsider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={newShift.assignedTo}
                    onChange={(e) => setNewShift({ ...newShift, assignedTo: e.target.value })}
                    placeholder={user.username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newShift.description}
                    onChange={(e) => setNewShift({ ...newShift, description: e.target.value })}
                    placeholder="Enter shift description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddShift}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Shift
                </button>
                <button
                  onClick={() => setShowAddShift(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
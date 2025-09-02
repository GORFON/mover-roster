'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';

interface User {
  username: string;
  role: 'driver' | 'outsider';
  isAuthenticated: boolean;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  role: 'driver' | 'outsider';
  dueDate: string;
  createdAt: string;
  estimatedDuration: string;
}

export default function JobsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddJob, setShowAddJob] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    role: 'driver' as 'driver' | 'outsider',
    dueDate: '',
    estimatedDuration: ''
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

    // Load jobs
    const jobsData = localStorage.getItem('jobs');
    if (jobsData) {
      setJobs(JSON.parse(jobsData));
    } else {
      // Initialize with some sample jobs
      const sampleJobs: Job[] = [
        {
          id: '1',
          title: 'Downtown Delivery Run',
          description: 'Deliver 15 packages to various downtown locations. Includes fragile items that need special handling. Route has been optimized for efficiency.',
          location: 'Downtown District',
          priority: 'high',
          status: 'pending',
          assignedTo: parsedUser.username,
          role: 'driver',
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          estimatedDuration: '4 hours'
        },
        {
          id: '2',
          title: 'Inventory Management',
          description: 'Update warehouse inventory system, verify stock levels, and prepare daily inventory report. Coordinate with suppliers for pending orders.',
          location: 'Main Warehouse',
          priority: 'medium',
          status: 'in-progress',
          assignedTo: parsedUser.username,
          role: 'outsider',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          estimatedDuration: '6 hours'
        },
        {
          id: '3',
          title: 'Customer Service Follow-up',
          description: 'Contact customers from last week&apos;s deliveries to ensure satisfaction and gather feedback. Update customer database with any changes.',
          location: 'Office',
          priority: 'low',
          status: 'completed',
          assignedTo: parsedUser.username,
          role: 'outsider',
          dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          estimatedDuration: '2 hours'
        }
      ];
      setJobs(sampleJobs);
      localStorage.setItem('jobs', JSON.stringify(sampleJobs));
    }
  }, [router]);

  const handleAddJob = () => {
    if (!newJob.title || !newJob.description || !newJob.location || !newJob.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const job: Job = {
      id: Date.now().toString(),
      ...newJob,
      assignedTo: newJob.assignedTo || user?.username || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedJobs = [...jobs, job];
    setJobs(updatedJobs);
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    
    setNewJob({
      title: '',
      description: '',
      location: '',
      priority: 'medium',
      assignedTo: '',
      role: 'driver',
      dueDate: '',
      estimatedDuration: ''
    });
    setShowAddJob(false);
  };

  const updateJobStatus = (jobId: string, newStatus: Job['status']) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    );
    setJobs(updatedJobs);
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
  };

  const deleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(job => filter === 'all' || job.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <button
            onClick={() => setShowAddJob(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Job
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg shadow p-1">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              <span className="ml-2 text-xs">
                ({status === 'all' ? jobs.length : jobs.filter(job => job.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                 onClick={() => setSelectedJob(job)}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                  {job.priority}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📍</span>
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📅</span>
                  Due: {new Date(job.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">⏱️</span>
                  {job.estimatedDuration}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.replace('-', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.role === 'driver' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {job.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">📋</div>
            <p className="text-gray-500">No jobs found for the selected filter.</p>
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">{selectedJob.location}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Due Date</h3>
                    <p className="text-gray-600">{new Date(selectedJob.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Estimated Duration</h3>
                    <p className="text-gray-600">{selectedJob.estimatedDuration}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Assigned To</h3>
                    <p className="text-gray-600">{selectedJob.assignedTo}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Priority</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedJob.priority)}`}>
                      {selectedJob.priority}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Role</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedJob.role === 'driver' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedJob.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex space-x-3 mb-4">
                {selectedJob.status !== 'pending' && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, 'pending')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Mark as Pending
                  </button>
                )}
                {selectedJob.status !== 'in-progress' && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, 'in-progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Job
                  </button>
                )}
                {selectedJob.status !== 'completed' && (
                  <button
                    onClick={() => updateJobStatus(selectedJob.id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>

              <button
                onClick={() => deleteJob(selectedJob.id)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Job
              </button>
            </div>
          </div>
        )}

        {/* Add Job Modal */}
        {showAddJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Job</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Downtown Delivery Run"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Detailed description of the job..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Downtown District"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newJob.priority}
                      onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newJob.role}
                      onChange={(e) => setNewJob({ ...newJob, role: e.target.value as 'driver' | 'outsider' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="driver">Driver</option>
                      <option value="outsider">Outsider</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={newJob.dueDate}
                    onChange={(e) => setNewJob({ ...newJob, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={newJob.estimatedDuration}
                    onChange={(e) => setNewJob({ ...newJob, estimatedDuration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 4 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={newJob.assignedTo}
                    onChange={(e) => setNewJob({ ...newJob, assignedTo: e.target.value })}
                    placeholder={user.username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddJob}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Job
                </button>
                <button
                  onClick={() => setShowAddJob(false)}
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
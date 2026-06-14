import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert,
  Search,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const axios = useAxios();

  const fetchData = async () => {
    try {
      setLoading(true);
      const metricsRes = await axios.get('/analytics/admin');
      setMetrics(metricsRes.data);

      const usersRes = await axios.get('/users');
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await axios.put(`/users/${userId}/toggle`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u));
      // Refresh analytics
      const metricsRes = await axios.get('/analytics/admin');
      setMetrics(metricsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle account status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const COLORS = ['#6366f1', '#a855f7'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Platform management and analytics</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Analytics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Students</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4 text-left">{metrics.cards.totalStudents}</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Teachers</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4 text-left">{metrics.cards.totalTeachers}</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Exams</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4 text-left">{metrics.cards.totalExams}</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase">AI Requests</span>
              <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4 text-left">{metrics.cards.aiRequests}</p>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Users</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4 text-left">{metrics.cards.activeUsers}</p>
          </Card>
        </div>
      )}

      {/* Graphs & AI Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="User Distribution" className="lg:col-span-1 text-left">
          {metrics && (
            <div className="h-64 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={metrics.roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Recent AI Activity Logs" className="lg:col-span-2 text-left">
          {metrics && metrics.recentAIUsage.length > 0 ? (
            <div className="space-y-4 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
              {metrics.recentAIUsage.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-300">
                        {log.userId?.name || 'Anonymous'} ({log.userId?.role || 'Guest'})
                      </p>
                      <p className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {log.details?.model || 'Gemini'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">{log.details?.endpoint}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <ShieldAlert className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-sm">No AI logs available yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* User Management Section */}
      <Card title="Manage System Users" subtitle="Activate or disable educational accounts" className="text-left">
        {/* Search */}
        <div className="relative w-full max-w-sm mb-6 text-left">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm"
          />
        </div>

        <Table headers={['Name', 'Email Address', 'Role', 'Status', 'Actions']}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-900/20 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-200">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    user.role === 'admin' 
                      ? 'bg-rose-500/10 text-rose-400' 
                      : user.role === 'teacher' 
                      ? 'bg-purple-500/10 text-purple-400' 
                      : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-slate-850 text-slate-400'
                  }`}>
                    {user.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.role !== 'admin' ? (
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      className={`flex items-center space-x-1 font-medium transition-colors duration-200 cursor-pointer ${
                        user.isActive 
                          ? 'text-rose-400 hover:text-rose-350' 
                          : 'text-emerald-400 hover:text-emerald-350'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          <span>Enable</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Protected</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                No users found matching query
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
};

export default AdminDashboard;

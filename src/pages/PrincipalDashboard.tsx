import React, { useEffect, useState } from 'react';
import { UserPlus, Users, Key, Shield, Trash2, CheckCircle, XCircle, BookOpen, Plus, Activity } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button, Input, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { User, UserRole, Subject } from '../types';
import { generateUniqueId } from '../lib/idUtils';

export default function PrincipalDashboard() {
  const { fetchUsers, addUser, resetPassword, fetchSystemStats, fetchSubjects, addSubject } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, exams: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subjects'>('overview');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for User
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newDept, setNewDept] = useState('');
  const [newPassword, setNewPassword] = useState('1234');

  // Form state for Subject
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [allUsers, allSubjects, systemStats] = await Promise.all([
        fetchUsers(),
        fetchSubjects(),
        fetchSystemStats()
      ]);
      setUsers(allUsers);
      setSubjects(allSubjects);
      setStats(systemStats);
      setLoading(false);
    };
    loadData();
  }, [fetchUsers, fetchSubjects, fetchSystemStats]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const year = new Date().getFullYear();
      
      let prefix = '';
      if (newRole === 'student') prefix = `STU-${year}-`;
      else if (newRole === 'teacher') prefix = `TCH-${newDept.substring(0, 3).toUpperCase() || 'GEN'}-`;
      else prefix = `PRN-`;

      const generatedId = await generateUniqueId(prefix);

      const newUser: User = {
        id: generatedId,
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        created_at: new Date().toISOString()
      };

      const success = await addUser(newUser);
      if (success) {
        setNewName('');
        setNewEmail('');
        setNewDept('');
        const updatedUsers = await fetchUsers();
        setUsers(updatedUsers);
        const updatedStats = await fetchSystemStats();
        setStats(updatedStats);
      }
    } catch (err) {
      console.error('Error creating user:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName) return;
    const success = await addSubject(newSubjectName);
    if (success) {
      setNewSubjectName('');
      const updatedSubjects = await fetchSubjects();
      setSubjects(updatedSubjects);
    }
  };

  const handleResetPassword = async (id: string) => {
    const success = await resetPassword(id);
    if (success) {
      alert(`Password for user ${id} has been reset to "password123". Please inform the user.`);
    } else {
      alert('Failed to reset password. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Principal Dashboard">
      <div className="space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 md:gap-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:bg-white/5'}`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:bg-white/5'}`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'subjects' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:bg-white/5'}`}
          >
            Subject Management
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <StatCard title="Total Students" value={stats.students} icon={Users} color="text-accent-blue" />
              <StatCard title="Total Teachers" value={stats.teachers} icon={Shield} color="text-accent-emerald" />
              <StatCard title="Total Exams" value={stats.exams} icon={BookOpen} color="text-accent-amber" />
            </div>

            <Card className="p-6 md:p-8 bg-gradient-to-br from-accent-blue/10 to-transparent border-accent-blue/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-accent-blue/20 rounded-xl shrink-0">
                  <Activity className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-bold">System Health</h4>
                  <p className="text-text-secondary text-xs md:text-sm">All systems are operational. Database connection active.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase mb-1">Last Backup</p>
                  <p className="text-xs md:text-sm font-medium">Today, 04:00 AM</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase mb-1">Server Uptime</p>
                  <p className="text-xs md:text-sm font-medium">14 Days, 6 Hours</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-4 md:p-6 lg:col-span-1 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-5 h-5 text-accent-blue" />
                <h3 className="text-lg md:text-xl font-bold">Create User</h3>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input label="Full Name" placeholder="John Doe" value={newName} onChange={e => setNewName(e.target.value)} required />
                <Input label="Email Address" type="email" placeholder="john@university.edu" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                <Input label="Initial Password" type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary ml-1">Role</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm md:text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                  >
                    <option value="student" className="bg-[#0A0A0B]">Student</option>
                    <option value="teacher" className="bg-[#0A0A0B]">Teacher</option>
                    <option value="principal" className="bg-[#0A0A0B]">Principal</option>
                  </select>
                </div>

                {newRole === 'teacher' && (
                  <Input label="Department Code" placeholder="e.g. SCI, MATH, ENG" value={newDept} onChange={e => setNewDept(e.target.value)} required />
                )}

                <Button type="submit" className="w-full mt-4" isLoading={isCreating}>
                  Generate Credentials
                </Button>
              </form>
            </Card>

            <Card className="lg:col-span-2 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg md:text-xl font-bold">User Management</h3>
                <Badge variant="info">{users.length} Total Users</Badge>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4">User Details</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Role / ID</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <p className="font-medium text-sm md:text-base">{u.name}</p>
                          <p className="text-[10px] md:text-xs text-text-secondary truncate max-w-[150px]">{u.email}</p>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <Badge variant={u.role === 'principal' ? 'danger' : u.role === 'teacher' ? 'success' : 'info'}>
                            {u.role.toUpperCase()}
                          </Badge>
                          <p className="text-[10px] md:text-xs font-mono mt-1 text-text-secondary">{u.id}</p>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleResetPassword(u.id)}
                              className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-accent-blue transition-colors"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-4 md:p-6 lg:col-span-1 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-accent-blue" />
                <h3 className="text-lg md:text-xl font-bold">Add Subject</h3>
              </div>
              <div className="space-y-4">
                <Input
                  label="Subject Name"
                  placeholder="e.g. Advanced Mathematics"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
                <Button className="w-full" onClick={handleAddSubject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <div className="p-4 md:p-6 border-b border-white/5">
                <h3 className="text-lg md:text-xl font-bold">Available Subjects</h3>
              </div>
              <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((subject) => (
                  <div key={subject.subject_id} className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="w-8 h-8 bg-accent-blue/10 rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-accent-blue" />
                      </div>
                      <span className="font-medium text-sm md:text-base truncate">{subject.subject_name}</span>
                    </div>
                    <button className="text-accent-red hover:opacity-80 shrink-0 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {subjects.length === 0 && (
                  <p className="text-text-secondary italic col-span-2 text-center py-8">No subjects added yet.</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{title}</p>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}

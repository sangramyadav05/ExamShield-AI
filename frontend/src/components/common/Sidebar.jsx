import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  ClipboardList, 
  MessageSquare,
  GraduationCap
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/teacher-dashboard', icon: LayoutDashboard },
    { name: 'Create Exam', path: '/create-exam', icon: PlusCircle },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
    { name: 'Exams List', path: '/exams', icon: GraduationCap },
    { name: 'AI Study Assistant', path: '/study-assistant', icon: MessageSquare },
  ];

  const getLinks = () => {
    switch (user.role) {
      case 'admin':
        return adminLinks;
      case 'teacher':
        return teacherLinks;
      case 'student':
        return studentLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 h-[calc(100vh-73px)] border-r border-slate-800/80 bg-[#070b19] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
          Navigation Menu
        </p>
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/15 border-l-2 border-indigo-500 text-indigo-300'
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-xl">
        <p className="text-xs text-slate-500">Logged in as:</p>
        <p className="text-sm font-medium text-slate-300 truncate">{user.email}</p>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Shield, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          EXAMSHIELD AI
        </span>
      </div>

      {user && (
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-xs text-indigo-400 capitalize">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-rose-400 transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

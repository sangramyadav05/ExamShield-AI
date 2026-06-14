import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex justify-center items-center bg-gradient-premium px-6">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-slate-800 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {!submitted ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Password?</h2>
              <p className="text-sm text-slate-400 mt-1.5 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2 font-semibold cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Reset Link</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-5">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Reset Link Sent</h2>
            <p className="text-sm text-slate-400 mt-3 max-w-xs leading-relaxed">
              If an account exists for <span className="text-indigo-300 font-medium">{email}</span>, we have sent password reset instructions to that inbox.
            </p>
          </div>
        )}

        <div className="flex justify-center mt-8 pt-4 border-t border-slate-800/60">
          <Link to="/login" className="flex items-center space-x-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col justify-center items-center px-6 text-center bg-gradient-premium relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl z-10 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Exam Assessment</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
          Secure, Intelligent <br />
          <span className="text-gradient">AI-Powered Evaluations</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          ExamShield AI transforms traditional exam management with instant grading analysis, syllabus-aligned question generation, and secure academic assessments.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/login" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto text-center">
            Get Started
          </Link>
          <Link to="/register" className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto text-center">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-24 z-10 w-full animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
        <div className="glass-card p-6 rounded-2xl text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">AI Answer Evaluation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Gemini parses student short/long answers to review clarity, correctness, grammar, and syllabus concepts.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl text-left">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Instant Question Generator</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Teachers input specifications and let Gemini build high-quality MCQs, short and long answer questions.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Secure Exam Engine</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Shielded payload architectures filter answers from client bundles and enforce exam timer verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

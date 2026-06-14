import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import Card from '../components/common/Card';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';

const ExamPortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axios = useAxios();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Exam Progress State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answerText }
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Warning metrics (Tab focus tracking)
  const [warnings, setWarnings] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/exams/${id}`);
        setExam(data);
        setTimeLeft(data.duration * 60);

        // Prepopulate answers mapping
        const initialAnswers = {};
        data.questions.forEach((q) => {
          initialAnswers[q._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load examination portal');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Tab Switch Blur detector
  useEffect(() => {
    const handleBlur = () => {
      setWarnings((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          alert('SYSTEM ALERT: Excessive tab switches detected. Your activity has been logged for examination review.');
        } else {
          alert(`EXAMSHIELD SECURITY ALERT: Please remain on this tab. Focus switch detected. Warning ${next}/3.`);
        }
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Timer Tick Down
  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const handleSelectOption = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  const handleTextInput = (questionId, text) => {
    setAnswers({
      ...answers,
      [questionId]: text
    });
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleAutoSubmit = () => {
    alert('TIMEOUT: Time limit reached! Automatically submitting answers.');
    submitAnswers();
  };

  const submitAnswers = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);

    // Format request payload: { examId, answers: [{ questionId, studentAnswer }] }
    const formattedAnswers = Object.keys(answers).map((qId) => ({
      questionId: qId,
      studentAnswer: answers[qId]
    }));

    try {
      await axios.post('/submissions', {
        examId: id,
        answers: formattedAnswers
      });
      alert('Examination submitted successfully. Triggering AI answer evaluation...');
      navigate('/student-dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit exam. Check connections.');
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    const answeredCount = Object.values(answers).filter(val => val.trim() !== '').length;
    const totalCount = exam?.questions.length || 0;
    
    if (window.confirm(`Submit Exam? You answered ${answeredCount}/${totalCount} questions.`)) {
      submitAnswers();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-2" />
        <p className="text-sm text-slate-400">Bootstrapping secure portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-in fade-in duration-300">
        <Card className="border-rose-500/20">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
          <button onClick={() => navigate('/student-dashboard')} className="btn-secondary mt-6 w-full cursor-pointer">
            Back to Dashboard
          </button>
        </Card>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestionIndex];

  return (
    <div className="min-h-[calc(100vh-73px)] grid grid-cols-1 lg:grid-cols-4 bg-[#020617] animate-in fade-in duration-300">
      
      {/* Question panel (Middle 3 cols) */}
      <div className="lg:col-span-3 p-6 flex flex-col justify-between border-r border-slate-800/80 text-left">
        <div>
          {/* Upper Info */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-850">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{exam.subject}</span>
              <h1 className="text-2xl font-bold text-white mt-1">{exam.title}</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Warnings Indicator */}
              {warnings > 0 && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Security warnings: {warnings}/3</span>
                </div>
              )}

              {/* Timer */}
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-indigo-300 font-bold">
                <Clock className="w-4 h-4" />
                <span className="tabular-nums">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          {currentQ && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-500/15 text-indigo-400 uppercase">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  {currentQ.marks} Marks
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-semibold text-slate-200 leading-relaxed">
                {currentQ.questionText}
              </h2>

              {/* Input Area depending on Type */}
              <div className="pt-4">
                {currentQ.type === 'mcq' ? (
                  <div className="space-y-3">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = answers[currentQ._id] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQ._id, opt)}
                          className={`w-full text-left p-4 rounded-xl border font-medium transition-all duration-200 cursor-pointer flex items-center space-x-3 ${
                            isSelected
                              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={answers[currentQ._id] || ''}
                      onChange={(e) => handleTextInput(currentQ._id, e.target.value)}
                      placeholder="Type your explanation here..."
                      rows={8}
                      className="w-full p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none custom-scrollbar"
                    />
                    <p className="text-right text-xs text-slate-500">
                      Word Count: {(answers[currentQ._id] || '').trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-850 pt-6 mt-12">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary px-5 py-2.5 flex items-center space-x-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < exam.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="btn-primary px-5 py-2.5 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={confirmSubmit}
              disabled={submitting}
              className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 px-8 py-3 font-semibold cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Finish Examination</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Questions tracker sidebar (Right col) */}
      <div className="hidden lg:block p-6 bg-[#070b19]/60 backdrop-blur text-left">
        <h3 className="text-sm font-bold text-slate-250 uppercase tracking-wider mb-6">Exam Navigator</h3>
        <div className="grid grid-cols-4 gap-3">
          {exam.questions.map((q, idx) => {
            const hasAnswered = (answers[q._id] || '').trim() !== '';
            const isActive = currentQuestionIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-11 rounded-lg border font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow shadow-indigo-500/30'
                    : hasAnswered
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-12 space-y-4 border-t border-slate-800/60 pt-6">
          <div className="flex items-center space-x-2.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-indigo-600" />
            <span>Active Question</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-emerald-500/15 border border-emerald-500/30" />
            <span>Answered</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-slate-900/40 border border-slate-800" />
            <span>Unanswered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPortal;

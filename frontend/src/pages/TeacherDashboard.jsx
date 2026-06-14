import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  Check, 
  Eye, 
  Calendar, 
  Clock, 
  Award,
  BookOpen,
  ClipboardList,
  AlertCircle,
  FileText,
  HelpCircle,
  Loader2,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Exam Creation State
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    status: 'draft'
  });
  
  // AI Question Generation State
  const [aiForm, setAiForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    count: 5
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [createdExamId, setCreatedExamId] = useState(null);

  // Result View State
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);

  const axios = useAxios();

  const fetchData = async () => {
    try {
      setLoading(true);
      const metricsRes = await axios.get('/analytics/teacher');
      setMetrics(metricsRes.data);

      const examsRes = await axios.get('/exams');
      setExams(examsRes.data);

      const submissionsRes = await axios.get('/submissions');
      setSubmissions(submissionsRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/exams', examForm);
      setExams([data, ...exams]);
      setCreatedExamId(data._id);
      
      // Auto toggle to generator step
      setAiForm({
        ...aiForm,
        subject: examForm.subject,
        topic: examForm.topic
      });
      setShowAiModal(true);
    } catch (err) {
      alert('Failed to create exam');
    }
  };

  const handleGenerateQuestions = async () => {
    setAiLoading(true);
    try {
      const { data } = await axios.post('/questions/generate-ai', aiForm);
      setAiQuestions(data);
    } catch (err) {
      alert('AI Generation failed. Check API configuration.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!createdExamId) return;
    try {
      await axios.post('/questions/bulk', {
        examId: createdExamId,
        questions: aiQuestions
      });
      
      alert('Questions successfully generated and saved to Exam!');
      setShowAiModal(false);
      setAiQuestions([]);
      setCreatedExamId(null);
      
      // Reset forms
      setExamForm({
        title: '',
        description: '',
        subject: '',
        topic: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        status: 'draft'
      });
      
      fetchData();
      setActiveTab('dashboard');
    } catch (err) {
      alert('Failed to save questions');
    }
  };

  const handleUpdateExamStatus = async (examId, newStatus) => {
    try {
      await axios.put(`/exams/${examId}`, { status: newStatus });
      setExams(exams.map(e => e._id === examId ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? All linked questions will be deleted.')) return;
    try {
      await axios.delete(`/exams/${examId}`);
      setExams(exams.filter(e => e._id !== examId));
    } catch (err) {
      alert('Failed to delete exam');
    }
  };

  const handleViewResult = async (submissionId) => {
    setResultLoading(true);
    setShowResultModal(true);
    try {
      const { data } = await axios.get(`/submissions/result/${submissionId}`);
      setSelectedResult(data);
    } catch (err) {
      alert('Result has not been generated or evaluated yet.');
      setShowResultModal(false);
    } finally {
      setResultLoading(false);
    }
  };

  const handleDownloadCSV = (result) => {
    if (!result) return;
    const headers = ["Question No", "Question", "Marks Obtained", "Accuracy", "Completeness", "Clarity", "Grammar", "Understanding", "Feedback", "Suggestions"];
    const rows = result.evaluationDetails.map((detail, idx) => [
      `Q${idx + 1}`,
      `"${(detail.questionId?.questionText || '').replace(/"/g, '""')}"`,
      detail.marksObtained,
      detail.analysis?.accuracy || 0,
      detail.analysis?.completeness || 0,
      detail.analysis?.clarity || 0,
      detail.analysis?.grammar || 0,
      detail.analysis?.conceptUnderstanding || 0,
      `"${(detail.feedback || '').replace(/"/g, '""')}"`,
      `"${(detail.suggestions || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ExamShield_Report_${result.studentId?.name || 'Student'}_${result.examId?.title || 'Exam'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const PIE_COLORS = ['#10b981', '#f43f5e'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Teacher Console</h1>
          <p className="text-sm text-slate-400 mt-1">Design examinations, preview metrics, and download grading reports</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'create' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Exam
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'submissions' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Submissions
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* TABS VIEW */}

      {activeTab === 'dashboard' && (
        <>
          {/* Metrics cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col justify-between text-left">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Exams</span>
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-4">{metrics.cards.totalExams}</p>
              </Card>

              <Card className="flex flex-col justify-between text-left">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Pass Percentage</span>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-4">{metrics.cards.passPercentage}%</p>
              </Card>

              <Card className="flex flex-col justify-between text-left">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Submissions</span>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-4">{metrics.cards.totalSubmissions}</p>
              </Card>
            </div>
          )}

          {/* Charts */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Exam Passing Performance" className="lg:col-span-1 text-left">
                <div className="h-64 flex flex-col justify-center">
                  {metrics.cards.totalSubmissions > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={metrics.performanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {metrics.performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                      <HelpCircle className="w-8 h-8 mb-2 text-slate-600" />
                      <p className="text-sm">No exam metrics available</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Class Marks Trend" className="lg:col-span-2 text-left">
                <div className="h-64 flex items-center justify-center">
                  {metrics.examPerformances.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={metrics.examPerformances}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} />
                        <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-slate-500">No exam data compiled yet</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Exams List table */}
          <Card title="Manage Examinations" subtitle="Configure statuses and review questions pools" className="text-left">
            <Table headers={['Exam Title', 'Subject', 'Topic', 'Duration', 'Status', 'Actions']}>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-200">{exam.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{exam.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{exam.topic || 'General'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{exam.duration}m</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={exam.status}
                        onChange={(e) => handleUpdateExamStatus(exam._id, e.target.value)}
                        className="bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 text-xs px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setCreatedExamId(exam._id);
                            setAiForm({
                              ...aiForm,
                              subject: exam.subject,
                              topic: exam.topic || ''
                            });
                            setShowAiModal(true);
                          }}
                          className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Add Qs</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam._id)}
                          className="text-xs text-rose-400 hover:text-rose-350 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No exams found. Click 'Create Exam' to get started!
                  </td>
                </tr>
              )}
            </Table>
          </Card>
        </>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto text-left">
          <Card title="Exam Setup" subtitle="Fill out settings to configure a new academic evaluation.">
            <form onSubmit={handleCreateExam} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    placeholder="E.g., Midterm Assessment"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Subject</label>
                  <input
                    type="text"
                    required
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    placeholder="E.g., Computer Science"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Topic (Optional)</label>
                  <input
                    type="text"
                    value={examForm.topic}
                    onChange={(e) => setExamForm({ ...examForm, topic: e.target.value })}
                    placeholder="E.g., Neural Networks"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={examForm.duration}
                    onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) || 0 })}
                    placeholder="60"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Passing Marks</label>
                  <input
                    type="number"
                    required
                    value={examForm.passingMarks}
                    onChange={(e) => setExamForm({ ...examForm, passingMarks: parseInt(e.target.value) || 0 })}
                    placeholder="40"
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Exam Description</label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="Provide exam instructions..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2 font-semibold cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Create Exam & Generate Questions</span>
              </button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'submissions' && (
        <Card title="Student Submissions" subtitle="Review exam papers and generated AI answer evaluations" className="text-left">
          <Table headers={['Student Name', 'Exam Paper', 'Subject', 'Status', 'Actions']}>
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <tr key={sub._id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">{sub.studentId?.name || 'Deleted student'}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{sub.examId?.title || 'Deleted exam'}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{sub.examId?.subject || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      sub.isEvaluated 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {sub.isEvaluated ? 'Evaluated' : 'Pending AI'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewResult(sub._id)}
                      className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{sub.isEvaluated ? 'View AI Scorecard' : 'Trigger Evaluation'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No submissions recorded yet
                </td>
              </tr>
            )}
          </Table>
        </Card>
      )}

      {/* AI QUESTION GENERATION WIZARD MODAL */}
      <Modal 
        isOpen={showAiModal} 
        onClose={() => setShowAiModal(false)} 
        title="AI Question Generator Suite"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 text-left">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/25 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Gemini Academic Engine Active</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Enter your test settings below. Gemini will return a robust balance of Multiple Choice, short explanation, and essay questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Subject</label>
              <input
                type="text"
                value={aiForm.subject}
                onChange={(e) => setAiForm({ ...aiForm, subject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Topic</label>
              <input
                type="text"
                value={aiForm.topic}
                onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Difficulty</label>
              <select
                value={aiForm.difficulty}
                onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Number of Questions</label>
              <input
                type="number"
                value={aiForm.count}
                onChange={(e) => setAiForm({ ...aiForm, count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 text-xs focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={aiLoading}
            className="w-full btn-primary py-2.5 flex items-center justify-center space-x-2 text-xs font-semibold cursor-pointer"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions Pools</span>
              </>
            )}
          </button>

          {/* Generated questions list preview */}
          {aiQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <h4 className="text-sm font-bold text-slate-200">Review generated questions:</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {aiQuestions.map((q, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 relative">
                    <button
                      onClick={() => setAiQuestions(aiQuestions.filter((_, qidx) => qidx !== i))}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold uppercase">
                        {q.type}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold">{q.marks} Marks</span>
                    </div>
                    <p className="text-xs text-slate-350 mt-2 font-medium">{q.questionText}</p>
                    {q.type === 'mcq' && q.options && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pl-2">
                        {q.options.map((opt, oidx) => (
                          <div key={oidx} className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mt-2 italic bg-slate-900/20 p-2 rounded border border-slate-800/30">
                      Ideal answer: {q.correctAnswer}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveQuestions}
                className="w-full btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 py-3 flex items-center justify-center space-x-2 font-semibold text-xs cursor-pointer mt-4"
              >
                <Check className="w-4 h-4" />
                <span>Save Question Paper to Exam</span>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* STUDENT EVALUATION RESULT REPORT MODAL */}
      <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)} title="AI Answer Assessment Details" maxWidth="max-w-4xl">
        {resultLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm text-slate-400 mt-2">Compiling scorecard analysis...</p>
          </div>
        ) : selectedResult ? (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800/60">
              <div>
                <h4 className="text-lg font-bold text-slate-200">{selectedResult.examId?.title}</h4>
                <p className="text-xs text-slate-400 mt-1">Subject: {selectedResult.examId?.subject}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleDownloadCSV(selectedResult)}
                  className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold border border-indigo-500/30 px-3 py-2 rounded-xl bg-indigo-500/5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedResult.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {selectedResult.status}
                  </span>
                  <p className="text-sm text-slate-400 mt-1.5 font-bold">
                    Score: {selectedResult.totalObtainedMarks} / {selectedResult.examId?.totalMarks}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800 text-slate-350 text-xs italic leading-relaxed">
              <span className="font-semibold text-slate-200 not-italic block mb-1">Overall AI Summary:</span>
              "{selectedResult.overallFeedback}"
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detailed breakdown:</h5>
              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                {selectedResult.evaluationDetails.map((detail, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-slate-850">
                    <p className="text-xs font-semibold text-slate-300">
                      Q{idx + 1}: {detail.questionId?.questionText || 'Question details'}
                    </p>
                    <div className="flex items-center space-x-3 mt-1.5">
                      <span className="text-[10px] text-indigo-400 font-semibold">
                        Marks: {detail.marksObtained} obtained
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                      {detail.analysis && Object.keys(detail.analysis).map((metric) => (
                        <div key={metric} className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-center">
                          <p className="text-[9px] text-slate-500 uppercase font-semibold">{metric}</p>
                          <p className="text-xs font-bold text-slate-300 mt-1">{detail.analysis[metric]}%</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-4">
                      <strong className="text-slate-300">Critique:</strong> {detail.feedback}
                    </p>
                    <p className="text-[11px] text-indigo-450 mt-1">
                      <strong className="text-indigo-400">Improvement suggestion:</strong> {detail.suggestions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Could not load results.</span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherDashboard;

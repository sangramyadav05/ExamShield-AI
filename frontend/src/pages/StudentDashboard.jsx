import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  Sparkles, 
  Clock, 
  Play, 
  Eye, 
  HelpCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StudentDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Result details modal state
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);

  const axios = useAxios();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const metricsRes = await axios.get('/analytics/student');
      setMetrics(metricsRes.data);

      const examsRes = await axios.get('/exams');
      setExams(examsRes.data);

      const submissionsRes = await axios.get('/submissions');
      setSubmissions(submissionsRes.data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewResult = async (examId) => {
    setResultLoading(true);
    setShowResultModal(true);
    try {
      const { data } = await axios.get(`/submissions/result/exam/${examId}`);
      setSelectedResult(data);
    } catch (err) {
      alert('AI Result not evaluated or has not been synced yet.');
      setShowResultModal(false);
    } finally {
      setResultLoading(false);
    }
  };

  const getExamStatusAction = (exam) => {
    const attemptedSub = submissions.find(s => s.examId?._id.toString() === exam._id.toString());
    
    if (attemptedSub) {
      return (
        <button
          onClick={() => handleViewResult(exam._id)}
          className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-350 font-bold border border-emerald-500/30 px-3 py-1.5 rounded-lg bg-emerald-500/5 transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Scorecard</span>
        </button>
      );
    }

    if (exam.status === 'published') {
      return (
        <button
          onClick={() => navigate(`/exam/${exam._id}`)}
          className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-350 font-bold border border-indigo-500/30 px-3 py-1.5 rounded-lg bg-indigo-500/5 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Attempt Exam</span>
        </button>
      );
    }

    return <span className="text-xs text-slate-500 font-medium italic">Closed</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight">Student Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Review active exams, marks analytics, and study suggestions</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col justify-between text-left">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase">Exams Attempted</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4">{metrics.cards.totalExamsAttempted}</p>
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
              <span className="text-xs font-semibold text-slate-400 uppercase">Average Grade</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-4">{metrics.cards.averagePercentage}%</p>
          </Card>
        </div>
      )}

      {/* AI Recommendations & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col">
          <Card className="h-full bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border-indigo-500/20 p-6 flex flex-col justify-between relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 w-48 h-48 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Tutor Recommendation</span>
              </div>
              <p className="text-sm text-slate-350 leading-relaxed italic">
                {metrics?.aiRecommendation || "Excellent work overall! Keep solving test series and revision papers."}
              </p>
            </div>
            <button
              onClick={() => navigate('/study-assistant')}
              className="mt-6 z-10 w-full btn-primary text-xs py-2.5 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Consult Study Assistant</span>
            </button>
          </Card>
        </div>

        <Card title="Marks Progress Trend" className="lg:col-span-2 text-left">
          <div className="h-64 flex items-center justify-center">
            {metrics && metrics.marksTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={metrics.marksTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="examName" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">Attempt exams to build performance progress trends</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject wise scores chart */}
        <Card title="Subject Wise Proficiency" className="lg:col-span-1 text-left">
          <div className="h-64 flex items-center justify-center">
            {metrics && metrics.subjectWiseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={metrics.subjectWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="averagePercentage" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500">No subject logs available</p>
            )}
          </div>
        </Card>

        {/* Exams Table */}
        <Card title="Available Examinations" subtitle="Participate in active syllabus assessments" className="lg:col-span-2 text-left">
          <Table headers={['Exam Title', 'Subject', 'Duration', 'Actions']}>
            {exams.length > 0 ? (
              exams.map((exam) => (
                <tr key={exam._id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-200">{exam.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{exam.subject}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{exam.duration}m</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getExamStatusAction(exam)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                  No examinations scheduled by academic staff yet
                </td>
              </tr>
            )}
          </Table>
        </Card>
      </div>

      {/* RESULT DETAILS MODAL */}
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

export default StudentDashboard;

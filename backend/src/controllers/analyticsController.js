import User from '../models/User.js';
import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import Result from '../models/Result.js';
import Analytics from '../models/Analytics.js';

// @desc    Get Admin Dashboard metrics
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalExams = await Exam.countDocuments({});
    
    // AI request logs count
    const aiRequests = await Analytics.countDocuments({ type: 'ai_request' });
    const activeUsers = await User.countDocuments({ isActive: true, role: { $ne: 'admin' } });

    // AI Usage trend
    const recentAIUsage = await Analytics.find({ type: 'ai_request' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email role');

    // Role Distribution
    const roleDistribution = [
      { name: 'Students', value: totalStudents },
      { name: 'Teachers', value: totalTeachers },
    ];

    return res.json({
      cards: {
        totalStudents,
        totalTeachers,
        totalExams,
        aiRequests,
        activeUsers,
      },
      roleDistribution,
      recentAIUsage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Teacher Dashboard metrics
// @route   GET /api/analytics/teacher
// @access  Private/Teacher
export const getTeacherAnalytics = async (req, res) => {
  try {
    // Exams created by this teacher
    const exams = await Exam.find({ teacherId: req.user._id });
    const examIds = exams.map(e => e._id);

    const totalExams = exams.length;
    const totalSubmissions = await Submission.countDocuments({ examId: { $in: examIds } });
    
    // Pass/Fail ratios
    const results = await Result.find({ examId: { $in: examIds } });
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;

    // Exam-wise performance details
    const examPerformances = [];
    for (let exam of exams) {
      const examResults = results.filter(r => r.examId.toString() === exam._id.toString());
      const avgScore = examResults.length > 0 
        ? Math.round(examResults.reduce((acc, curr) => acc + curr.totalObtainedMarks, 0) / examResults.length)
        : 0;

      examPerformances.push({
        name: exam.title,
        average: avgScore,
        total: exam.totalMarks,
        submissions: examResults.length,
      });
    }

    return res.json({
      cards: {
        totalExams,
        totalSubmissions,
        passPercentage: results.length > 0 ? Math.round((passCount / results.length) * 100) : 0,
      },
      performanceData: [
        { name: 'Passed', value: passCount },
        { name: 'Failed', value: failCount },
      ],
      examPerformances,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Student Dashboard metrics & recommendations
// @route   GET /api/analytics/student
// @access  Private/Student
export const getStudentAnalytics = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id })
      .populate('examId', 'title subject totalMarks passingMarks');

    const totalExamsAttempted = results.length;
    const passCount = results.filter(r => r.status === 'pass').length;

    // Marks trends
    const marksTrend = results.map(r => ({
      examName: r.examId?.title || 'Exam',
      score: r.totalObtainedMarks,
      total: r.examId?.totalMarks || 100,
    }));

    // Subject wise averages
    const subjectScores = {};
    results.forEach(r => {
      if (r.examId) {
        const subject = r.examId.subject;
        if (!subjectScores[subject]) {
          subjectScores[subject] = { totalObtained: 0, totalMarks: 0, count: 0 };
        }
        subjectScores[subject].totalObtained += r.totalObtainedMarks;
        subjectScores[subject].totalMarks += r.examId.totalMarks;
        subjectScores[subject].count += 1;
      }
    });

    const subjectWiseData = Object.keys(subjectScores).map(subject => ({
      subject,
      averagePercentage: Math.round((subjectScores[subject].totalObtained / subjectScores[subject].totalMarks) * 100),
    }));

    // Generate AI recommendations based on lowest metrics in evaluationDetails
    let lowestCriteriaName = 'General Study';
    let minScore = 100;
    
    results.forEach(resObj => {
      resObj.evaluationDetails.forEach(detail => {
        if (detail.analysis) {
          const { accuracy, completeness, clarity, grammar, conceptUnderstanding } = detail.analysis;
          const scores = { accuracy, completeness, clarity, grammar, conceptUnderstanding };
          Object.keys(scores).forEach(k => {
            if (scores[k] < minScore) {
              minScore = scores[k];
              lowestCriteriaName = k;
            }
          });
        }
      });
    });

    let aiRecommendation = 'Excellent work overall! Keep solving test series and revision papers.';
    if (minScore < 75) {
      if (lowestCriteriaName === 'completeness') {
        aiRecommendation = 'Recommendation: You are scoring lower on answer completeness. Make sure to address every sub-point of the query and draft longer, more detailed explanations.';
      } else if (lowestCriteriaName === 'grammar') {
        aiRecommendation = 'Recommendation: Focus on grammatical precision. Try using active voice, review punctuation, and double check technical definitions before submitting.';
      } else if (lowestCriteriaName === 'clarity') {
        aiRecommendation = 'Recommendation: Enhance answer clarity. Break down long paragraphs into clean bullet points and structure arguments logically.';
      } else if (lowestCriteriaName === 'conceptUnderstanding') {
        aiRecommendation = 'Recommendation: Core syllabus revision suggested. Read through the syllabus topics again or ask the AI Study Assistant to clarify key textbook concepts.';
      } else {
        aiRecommendation = 'Recommendation: Work on factual accuracy. Avoid guessing answers and verify specific formulas or dates before attempting tests.';
      }
    }

    return res.json({
      cards: {
        totalExamsAttempted,
        passPercentage: totalExamsAttempted > 0 ? Math.round((passCount / totalExamsAttempted) * 100) : 0,
        averagePercentage: results.length > 0 
          ? Math.round((results.reduce((acc, curr) => {
              const base = curr.examId?.totalMarks || 100;
              return acc + (curr.totalObtainedMarks / base);
            }, 0) / results.length) * 100)
          : 0,
      },
      marksTrend,
      subjectWiseData,
      aiRecommendation,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

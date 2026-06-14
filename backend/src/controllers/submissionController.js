import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Result from '../models/Result.js';
import Analytics from '../models/Analytics.js';
import { evaluateAnswersAI } from '../services/geminiService.js';

// @desc    Submit answers for an exam
// @route   POST /api/submissions
// @access  Private/Student
export const submitExam = async (req, res) => {
  const { examId, answers } = req.body;

  if (!examId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'ExamId and answers array are required' });
  }

  try {
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({
      studentId: req.user._id,
      examId,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }

    // Create Submission document
    const submission = await Submission.create({
      studentId: req.user._id,
      examId,
      answers,
    });

    // Track attempt analytics
    await Analytics.create({
      type: 'exam_attempt',
      userId: req.user._id,
    });

    // Run AI Evaluation
    const evaluation = await evaluateAnswersAI({
      exam,
      submission,
      questions: exam.questions,
    });

    // Calculate pass/fail status
    const status = evaluation.totalObtainedMarks >= exam.passingMarks ? 'pass' : 'fail';

    // Create Result document
    const result = await Result.create({
      submissionId: submission._id,
      studentId: req.user._id,
      examId,
      totalObtainedMarks: evaluation.totalObtainedMarks,
      evaluationDetails: evaluation.evaluationDetails,
      overallFeedback: evaluation.overallFeedback,
      status,
    });

    // Update Submission status
    submission.isEvaluated = true;
    await submission.save();

    // Log AI usage
    await Analytics.create({
      type: 'ai_request',
      userId: req.user._id,
      details: {
        endpoint: '/api/submissions',
        model: 'gemini-1.5-flash',
        promptTokens: 800,
        completionTokens: 600,
      },
    });

    return res.status(201).json({
      message: 'Exam submitted and evaluated successfully',
      submissionId: submission._id,
      resultId: result._id,
      result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions (Teacher sees all for their exams, Student sees their own)
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (req, res) => {
  try {
    let submissions;

    if (req.user.role === 'admin') {
      submissions = await Submission.find({})
        .populate('studentId', 'name email')
        .populate('examId', 'title subject totalMarks');
    } else if (req.user.role === 'teacher') {
      // Find all exams created by this teacher
      const exams = await Exam.find({ teacherId: req.user._id });
      const examIds = exams.map((e) => e._id);

      submissions = await Submission.find({ examId: { $in: examIds } })
        .populate('studentId', 'name email')
        .populate('examId', 'title subject totalMarks');
    } else {
      // student sees their own submissions
      submissions = await Submission.find({ studentId: req.user._id })
        .populate('examId', 'title subject totalMarks duration status');
    }

    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get result by exam ID (Student fetches their graded result)
// @route   GET /api/submissions/result/exam/:examId
// @access  Private
export const getResultByExamId = async (req, res) => {
  try {
    const result = await Result.findOne({
      examId: req.params.examId,
      studentId: req.user._id,
    })
      .populate('examId', 'title subject totalMarks passingMarks duration')
      .populate('evaluationDetails.questionId');

    if (!result) {
      return res.status(404).json({ message: 'Result not found for this exam' });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get result by result ID
// @route   GET /api/submissions/result/:id
// @access  Private
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('examId', 'title subject totalMarks passingMarks duration')
      .populate('evaluationDetails.questionId');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Security check: Students can only access their own results
    if (req.user.role === 'student' && result.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this result' });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

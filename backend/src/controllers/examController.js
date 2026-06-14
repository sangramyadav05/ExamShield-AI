import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Teacher
export const createExam = async (req, res) => {
  const { title, description, subject, topic, duration, totalMarks, passingMarks, scheduledAt, expiresAt } = req.body;

  try {
    const exam = await Exam.create({
      title,
      description,
      subject,
      topic,
      teacherId: req.user._id,
      duration,
      totalMarks,
      passingMarks,
      scheduledAt,
      expiresAt,
    });

    return res.status(201).json(exam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all exams (context dependent)
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res) => {
  try {
    let exams;
    if (req.user.role === 'admin') {
      exams = await Exam.find({}).populate('teacherId', 'name email');
    } else if (req.user.role === 'teacher') {
      exams = await Exam.find({ teacherId: req.user._id });
    } else {
      // student sees only published/closed exams
      exams = await Exam.find({ status: { $in: ['published', 'closed'] } }).populate('teacherId', 'name email');
    }
    return res.json(exams);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('questions');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Students shouldn't see correct answers when fetching exam to attempt
    if (req.user.role === 'student') {
      if (exam.status !== 'published') {
        return res.status(403).json({ message: 'Exam is not active' });
      }

      // Check if student already submitted this exam
      const alreadySubmitted = await Submission.findOne({
        studentId: req.user._id,
        examId: exam._id,
      });

      if (alreadySubmitted) {
        return res.status(400).json({
          message: 'You have already submitted this exam',
          submissionId: alreadySubmitted._id,
          isEvaluated: alreadySubmitted.isEvaluated,
        });
      }

      // Strip correctAnswer from questions list for security
      const securedQuestions = exam.questions.map((q) => {
        const secured = q.toObject();
        delete secured.correctAnswer;
        return secured;
      });

      const securedExam = exam.toObject();
      securedExam.questions = securedQuestions;
      return res.json(securedExam);
    }

    return res.json(exam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Teacher
export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this exam' });
    }

    Object.assign(exam, req.body);
    const updatedExam = await exam.save();
    return res.json(updatedExam);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Teacher
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    // Delete associated questions
    await Question.deleteMany({ examId: exam._id });
    await exam.deleteOne();

    return res.json({ message: 'Exam and associated questions deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

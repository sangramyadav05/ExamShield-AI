import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import { generateQuestionsAI } from '../services/geminiService.js';
import Analytics from '../models/Analytics.js';

// @desc    Generate questions using AI
// @route   POST /api/questions/generate-ai
// @access  Private/Teacher
export const generateQuestions = async (req, res) => {
  const { subject, topic, difficulty, count } = req.body;

  if (!subject || !difficulty || !count) {
    return res.status(400).json({ message: 'Subject, difficulty, and count are required' });
  }

  try {
    const questions = await generateQuestionsAI({ subject, topic, difficulty, count });

    // Track AI request analytics
    await Analytics.create({
      type: 'ai_request',
      userId: req.user._id,
      details: {
        endpoint: '/api/questions/generate-ai',
        model: 'gemini-1.5-flash',
        promptTokens: 300,
        completionTokens: 500,
      },
    });

    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Save bulk questions to an exam
// @route   POST /api/questions/bulk
// @access  Private/Teacher
export const saveBulkQuestions = async (req, res) => {
  const { examId, questions } = req.body;

  if (!examId || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'ExamId and questions array are required' });
  }

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Assign examId to each question
    const formattedQuestions = questions.map((q) => ({
      ...q,
      examId,
    }));

    const savedQuestions = await Question.insertMany(formattedQuestions);
    const savedIds = savedQuestions.map((q) => q._id);

    // Append questions to the exam
    exam.questions.push(...savedIds);
    await exam.save();

    return res.status(201).json(savedQuestions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a question manually
// @route   POST /api/questions
// @access  Private/Teacher
export const createQuestion = async (req, res) => {
  const { examId, type, questionText, options, correctAnswer, marks, difficulty, subject, topic } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const question = await Question.create({
      examId,
      type,
      questionText,
      options,
      correctAnswer,
      marks,
      difficulty,
      subject,
      topic,
    });

    exam.questions.push(question._id);
    await exam.save();

    return res.status(201).json(question);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Teacher
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    Object.assign(question, req.body);
    const updatedQuestion = await question.save();
    return res.json(updatedQuestion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Teacher
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Remove reference from Exam
    if (question.examId) {
      const exam = await Exam.findById(question.examId);
      if (exam) {
        exam.questions = exam.questions.filter((qId) => qId.toString() !== question._id.toString());
        await exam.save();
      }
    }

    await question.deleteOne();
    return res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

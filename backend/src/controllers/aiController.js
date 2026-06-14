import ChatHistory from '../models/ChatHistory.js';
import { chatStudyAssistant } from '../services/geminiService.js';
import Analytics from '../models/Analytics.js';

// @desc    Get chat sessions list
// @route   GET /api/ai/sessions
// @access  Private/Student
export const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatHistory.find({ studentId: req.user._id })
      .select('sessionName createdAt updatedAt')
      .sort({ updatedAt: -1 });
    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat messages in a session
// @route   GET /api/ai/sessions/:id
// @access  Private/Student
export const getChatMessages = async (req, res) => {
  try {
    const session = await ChatHistory.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    return res.json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Send message to AI Study Assistant
// @route   POST /api/ai/chat
// @access  Private/Student
export const sendMessageToAssistant = async (req, res) => {
  const { message, sessionId, sessionName } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  try {
    let session;

    if (sessionId) {
      session = await ChatHistory.findOne({ _id: sessionId, studentId: req.user._id });
    }

    // If no session found, create a new one
    if (!session) {
      session = await ChatHistory.create({
        studentId: req.user._id,
        sessionName: sessionName || (message.substring(0, 30) + '...'),
        messages: [],
      });
    }

    // Fetch message history formatted for Gemini
    const chatHistory = session.messages.map((m) => ({
      sender: m.sender,
      message: m.message,
    }));

    // Trigger AI response
    const aiResponse = await chatStudyAssistant({
      chatHistory,
      newMessage: message,
    });

    // Push messages to session
    session.messages.push(
      { sender: 'student', message },
      { sender: 'ai', message: aiResponse }
    );

    await session.save();

    // Log AI usage
    await Analytics.create({
      type: 'ai_request',
      userId: req.user._id,
      details: {
        endpoint: '/api/ai/chat',
        model: 'gemini-1.5-flash',
        promptTokens: 200,
        completionTokens: 250,
      },
    });

    return res.json({
      sessionId: session._id,
      sessionName: session.sessionName,
      reply: aiResponse,
      messages: session.messages,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

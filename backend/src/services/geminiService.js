import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not defined. Using mock AI service.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generates test questions using AI
 */
export const generateQuestionsAI = async ({ subject, topic, difficulty, count }) => {
  const genAI = getGeminiClient();

  if (!genAI) {
    // Return high quality mock data if API key is not configured
    return generateMockQuestions({ subject, topic, difficulty, count });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      You are an expert academic examiner. Generate exactly ${count} exam questions.
      
      Topic details:
      - Subject: ${subject}
      - Topic: ${topic || 'General'}
      - Difficulty: ${difficulty} (easy, medium, hard)

      You must generate a mixed variety of:
      - "mcq" (Multiple Choice Questions, must include 4 options)
      - "short" (Short Answer Questions)
      - "long" (Long Answer / Essay Questions)

      Each question must have:
      1. "type": either "mcq", "short", or "long"
      2. "questionText": the query string
      3. "options": an array of 4 string options (only for "mcq", empty array for short/long)
      4. "correctAnswer": For mcq, it must be the exact string of the correct option. For short/long, it must be detailed ideal evaluation grading guidelines.
      5. "marks": weightage points (e.g., mcq = 2, short = 5, long = 10)
      6. "difficulty": "${difficulty}"
      7. "subject": "${subject}"
      8. "topic": "${topic || 'General'}"

      Output must be a JSON array of these question objects. Do not include any markdown wrappers or text outside the JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Question Generation Error:', error);
    // Fallback to mock questions on API error
    return generateMockQuestions({ subject, topic, difficulty, count });
  }
};

/**
 * Evaluates student answers using Gemini
 */
export const evaluateAnswersAI = async ({ exam, submission, questions }) => {
  const genAI = getGeminiClient();

  if (!genAI) {
    return generateMockEvaluation({ exam, submission, questions });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    // Structure student submissions alongside questions
    const answersData = submission.answers.map((ans) => {
      const q = questions.find((ques) => ques._id.toString() === ans.questionId.toString());
      return {
        questionId: ans.questionId,
        questionText: q?.questionText || '',
        type: q?.type || 'short',
        correctGuidelines: q?.correctAnswer || '',
        maxMarks: q?.marks || 5,
        studentAnswer: ans.studentAnswer,
      };
    });

    const prompt = `
      You are an automated academic grading engine. Evaluate the student answers below.
      Compare the student's answer to the correct guidelines/answers provided.

      Here is the list of answers to grade:
      ${JSON.stringify(answersData, null, 2)}

      For each answer, calculate:
      - "marksObtained": from 0 up to "maxMarks". If it's a perfect MCQ, give full marks. If it's short/long, score it proportionally based on accuracy and completeness.
      - "feedback": a short encouraging critique.
      - "suggestions": a concrete way to improve their explanation or content.
      - "analysis": score each metric out of 100:
        - "accuracy": factual correctness.
        - "completeness": did they address all parts of the question.
        - "clarity": is the writing structure clean.
        - "grammar": spelling and writing mechanics.
        - "conceptUnderstanding": grasp of the underlying syllabus.

      You must return a single JSON object structured as follows:
      {
        "totalObtainedMarks": <number sum of all marksObtained>,
        "evaluationDetails": [
          {
            "questionId": "string matching target questionId",
            "marksObtained": <number>,
            "feedback": "string",
            "suggestions": "string",
            "analysis": {
              "accuracy": <number 0-100>,
              "completeness": <number 0-100>,
              "clarity": <number 0-100>,
              "grammar": <number 0-100>,
              "conceptUnderstanding": <number 0-100>
            }
          }
        ],
        "overallFeedback": "general exam summary comments string"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Answer Evaluation Error:', error);
    return generateMockEvaluation({ exam, submission, questions });
  }
};

/**
 * AI Study Assistant Doubt Solving Chat
 */
export const chatStudyAssistant = async ({ chatHistory, newMessage }) => {
  const genAI = getGeminiClient();

  if (!genAI) {
    return `Hello! I am your AI Study Assistant. (Note: GEMINI_API_KEY is not configured, running in sandbox mode). 

Regarding your question: "${newMessage}"
I recommend reviewing core notes for this topic. Let me know if you would like me to generate a personalized study plan or explain specific details of this syllabus!`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format chat history for Gemini API
    const contents = chatHistory.flatMap((msg) => [
      {
        role: msg.sender === 'student' ? 'user' : 'model',
        parts: [{ text: msg.message }],
      },
    ]);

    // Add new user message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }],
    });

    const systemInstruction = `You are a supportive, intellectual, and friendly AI Study Assistant. 
    Your goal is to explain academic topics clearly, suggest comprehensive study plans, provide learning recommendations, and solve doubts.
    Always provide structured responses, using formatting like lists and bold text where relevant. Maintain a positive, teaching-focused tone.`;

    const chat = model.startChat({
      history: contents.slice(0, -1), // history excludes the new message
      systemInstruction,
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Chat Assistant Error:', error);
    return `I apologize, but I encountered an issue while processing that request. Please try again.`;
  }
};

// ================= MOCK FALLBACK UTILITIES =================

function generateMockQuestions({ subject, topic, difficulty, count }) {
  const mockQuestions = [];
  const baseMarks = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 5 : 8;

  for (let i = 1; i <= count; i++) {
    const type = i % 3 === 1 ? 'mcq' : i % 3 === 2 ? 'short' : 'long';
    mockQuestions.push({
      type,
      questionText: `Sample Question ${i} about ${topic || 'General concepts'} in ${subject} (${difficulty.toUpperCase()} level)`,
      options: type === 'mcq' ? ['Option A (Correct)', 'Option B', 'Option C', 'Option D'] : [],
      correctAnswer: type === 'mcq' ? 'Option A (Correct)' : 'Detailed grading guidelines for evaluating the student\'s understanding of this concept.',
      marks: type === 'mcq' ? 2 : type === 'short' ? baseMarks : baseMarks * 2,
      difficulty,
      subject,
      topic: topic || 'General',
    });
  }
  return mockQuestions;
}

function generateMockEvaluation({ exam, submission, questions }) {
  let totalObtainedMarks = 0;
  const evaluationDetails = submission.answers.map((ans) => {
    const q = questions.find((ques) => ques._id.toString() === ans.questionId.toString());
    const maxMarks = q ? q.marks : 5;
    
    // MCQs automatically graded (if student answered Option A or similar)
    let obtained = Math.floor(maxMarks * 0.75); // generic average score
    if (q && q.type === 'mcq') {
      obtained = ans.studentAnswer === q.correctAnswer ? maxMarks : 0;
    }

    totalObtainedMarks += obtained;

    return {
      questionId: ans.questionId,
      marksObtained: obtained,
      feedback: obtained > 0 ? 'Good effort, key details are correct.' : 'Incorrect answer. Please review the material.',
      suggestions: obtained < maxMarks ? 'Try to explain using diagrams or bulleted lists for clarity.' : 'Excellent work! Keep it up.',
      analysis: {
        accuracy: obtained > 0 ? 80 : 0,
        completeness: obtained > 0 ? 85 : 0,
        clarity: obtained > 0 ? 90 : 0,
        grammar: 95,
        conceptUnderstanding: obtained > 0 ? 85 : 0,
      },
    };
  });

  return {
    totalObtainedMarks,
    evaluationDetails,
    overallFeedback: `Good job finishing the exam. You obtained ${totalObtainedMarks} marks out of ${exam.totalMarks || 100}. Focus on core concepts to secure better results next time.`,
  };
}

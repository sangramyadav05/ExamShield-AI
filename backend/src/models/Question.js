import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    type: {
      type: String,
      enum: ['mcq', 'short', 'long'],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
      },
    ], // Array of strings for MCQ options
    correctAnswer: {
      type: String,
      required: true, // option for MCQ, or ideal guidelines/answers for grading
    },
    marks: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;

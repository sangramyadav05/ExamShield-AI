import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    totalObtainedMarks: {
      type: Number,
      required: true,
    },
    evaluationDetails: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        marksObtained: {
          type: Number,
          required: true,
        },
        feedback: {
          type: String,
        },
        suggestions: {
          type: String,
        },
        analysis: {
          accuracy: { type: Number, min: 0, max: 100 },
          completeness: { type: Number, min: 0, max: 100 },
          clarity: { type: Number, min: 0, max: 100 },
          grammar: { type: Number, min: 0, max: 100 },
          conceptUnderstanding: { type: Number, min: 0, max: 100 },
        },
      },
    ],
    overallFeedback: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pass', 'fail'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);
export default Result;

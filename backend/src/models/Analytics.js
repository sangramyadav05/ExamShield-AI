import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['ai_request', 'login', 'exam_attempt'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: {
      promptTokens: { type: Number },
      completionTokens: { type: Number },
      model: { type: String },
      endpoint: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;

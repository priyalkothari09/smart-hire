const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedText: { type: String, default: '' },
    aiScore: { type: Number, default: 0 },
    aiFeedback: { type: String, default: '' },
    aiSkills: [{ type: String }],
    aiStrengths: [{ type: String }],
    aiWeaknesses: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
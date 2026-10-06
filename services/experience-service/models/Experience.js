import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String },
  year: { type: Number },
  createdBy: { type: String },
  rounds: { type: mongoose.Schema.Types.Mixed },
  quetions: { type: mongoose.Schema.Types.Mixed },
  tips: { type: mongoose.Schema.Types.Mixed },
  difficultyLevel: { type: String },
  difficulty: { type: String },
  createdDate: { type: Date, default: Date.now }
}, {
  collection: 'experience',
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Experience', experienceSchema, 'experience');

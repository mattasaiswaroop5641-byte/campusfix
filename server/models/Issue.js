import mongoose from 'mongoose';

const TimelineStepSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'],
    required: true
  },
  timestamp: { type: String, required: true },
  note: { type: String },
  by: { type: String }
}, { _id: false });

const AIAnalysisSchema = new mongoose.Schema({
  category: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  summary: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  confidence: { type: Number, default: 95 },
  keywordsDetected: [{ type: String }]
}, { _id: false });

const IssueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true }, // e.g. CF-1001
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  reporter: { type: String, required: true },
  reporterType: { type: String, enum: ['Student', 'Faculty'], required: true },
  reporterId: { type: String },
  reporterRegNo: { type: String },
  reporterEmail: { type: String },
  department: { 
    type: String, 
    required: true 
  },
  block: { 
    type: String, 
    enum: ['Block A', 'Block H', 'Block N', 'Block U'],
    required: true 
  },
  section: { 
    type: String, 
    default: 'N/A' // Strictly N/A for faculty
  },
  category: { 
    type: String, 
    required: true 
  },
  location: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Submitted'
  },
  assignedStaff: { type: String, default: null },
  imageUrl: { type: String, default: null },
  aiAnalysis: AIAnalysisSchema,
  timeline: [TimelineStepSchema],
  createdAt: { type: String, default: () => new Date().toLocaleString() },
  updatedAt: { type: String, default: () => new Date().toLocaleString() }
}, {
  timestamps: true
});

export const Issue = mongoose.model('Issue', IssueSchema);

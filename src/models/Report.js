const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ReportSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = model('Report', ReportSchema);

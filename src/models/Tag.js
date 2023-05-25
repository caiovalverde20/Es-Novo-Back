const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = model('Tag', TagSchema);

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TagSchema = new Schema({
  Name: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = model('Tag', TagSchema);

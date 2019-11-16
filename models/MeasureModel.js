const mongoose = require('mongoose');

const measureSchema = new mongoose.Schema({
  _id: {type: String, required: true},
  name: {type: String, required: true},
  model: String,
  factory_num: String,
  manufacturer: String,
  last_time: String,
  next_time: String,
  duration: String,
  abc: String,
  result: String, 
  location: String,
  usage: String,
  type: String,
  status: String
});

const MeasureModel = mongoose.model('measures', measureSchema);

module.exports = MeasureModel;
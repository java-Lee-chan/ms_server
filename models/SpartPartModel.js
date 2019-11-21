const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: {type: String, required: true},
  model: {type: String, required: true},
  specs: String,
  brand: String,
  price: {type: Number, required: true},
  num: {type: Number, required: true},
  unit: String,
  total: {type: Number, required: true},
  time: String,
  committer: {type: String, required: true},
  usage: String,
  status: String
});

const SpartPartModel = mongoose.model('spareParts', sparePartSchema);

module.exports = SpartPartModel;
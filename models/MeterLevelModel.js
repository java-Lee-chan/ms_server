const mongoose = require('mongoose');

const meterLevelSchema = new mongoose.Schema({
  father_id: String,
  name: {type: String, required: true},
  type: {type: String, required: true},
  meterId: String,
  remark: String
});

const MeterLevelModel = mongoose.model('meterLevels', meterLevelSchema);

MeterLevelModel.findOne({name: '天然气总表', type: 'gas'}).then(meterLevel => {
  if(!meterLevel){
    MeterLevelModel.create({name: '天然气总表', type: 'gas', remark: '这是天然气总表'})
      .then(meterLevel => {
        console.log('初始化最顶部的表');
      });
  }
});

MeterLevelModel.findOne({name: '电气总表', type: 'elec'}).then(meterLevel => {
  if(!meterLevel){
    MeterLevelModel.create({name: '电气总表', type: 'elec', remark: '这是电气总表'})
      .then(meterLevel => {
        console.log('初始化最顶部的表');
      });
  }
});
MeterLevelModel.findOne({name: '用水总表', type: 'water'}).then(meterLevel => {
  if(!meterLevel){
    MeterLevelModel.create({name: '用水总表', type: 'water', remark: '这是用水总表'})
      .then(meterLevel => {
        console.log('初始化最顶部的表');
      });
  }
});

module.exports = MeterLevelModel;
const express = require('express');
const md5 = require('blueimp-md5');

const path = require('path');
const fs = require('fs');

const UserModel = require('../models/UserModel');
const MeasureModel = require('../models/MeasureModel');


const router = express.Router();

// 登录的路由
router.post('/login', (req, res) => {
  const {username, password} = req.body;
  UserModel.findOne({username, password: md5(password)})
    .then(user => {
      if(user){
        // 生成一个cookie(userid: user._id),并交给浏览器保存
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24});
        if(user.role_id){
          RoleModel.findOne({_id: user.role_id})
            .then(role => {
              user._doc.role = role;
              console.log('role user', user);
              res.send({status: 0, data: user});
            })
        }else {
          user._doc.role = {menus: []};
          res.send({status: 0, data: user});
        }
      }else {
        res.send({status: 1, msg: '用户名或密码不正确'});
      }
    }).catch(error => {
      console.error('登陆异常', error);
      res.send({status: 1, msg: '登陆异常, 请重新尝试'});
    });
});

// 添加测量仪器的路由
router.post('/manage/measure/add', (req, res) => {
  const measure = req.body;
  MeasureModel.create(measure)
    .then(measure => {
      res.send({status: 0, data: measure});
    })
    .catch(error => {
      console.error('添加测量仪器失败', error);
      res.send({status: 1, msg: '添加测量仪器失败, 请重新尝试'});
    })
});

// 获取测量仪器列表的路由
router.get('/manage/measure/list', (req, res) => {
  MeasureModel.find({})
    .then(measures => {
      res.send({status: 0, data: measures});
    })
    .catch(error => {
      console.error('获取测量仪器列表异常', error);
      res.send({status: 1, msg: '获取测量仪器列表异常，请重新尝试'});
    })
});

// 编辑测量仪器的路由
router.post('/manage/measure/update', (req, res) => {
  const measure = req.body;
  MeasureModel.findOneAndUpdate({_id: measure._id}, measure)
    .then(oldMeasure => {
      res.send({status: 0})
    })
    .catch(error => {
      console.error('更新测量仪器异常', error);
      res.send({status: 1, msg: '更新测量仪器列表异常，请重新尝试'});
    });
});

// 检查计量编号是否重复的路由
router.post('/manage/measure/checkid', (req, res) => {
  const {_id} = req.body;
  MeasureModel.findOne({_id}).then(measure => {
    if(measure) {
      res.send({status: 1, msg: '该计量编号已存在'});
    }else {
      res.send({status: 0});
    }
  }).catch(error => {
    res.send({status: 1, msg: '查找失败'});
  })
});

// 下载测量仪器模板的路由
router.get('/manage/measure/downloadMeasureTemaplate', function(req, res) {
  const filePath = path.join(__dirname, '../public/测量仪器模板.xlsx');
  fs.exists(filePath, function(exist){
    if(exist){
      // res.set({
      //   "Content-type": "application/octet-stream",
      //   "Content-Disposition":"attachment;filename=测量仪器模板.xlsx"
      // });
      // fReadStream = fs.createReadStream(filePath);
      // fReadStream.on("data", (chunk) => res.write(chunk, 'binary'));
      // fReadStream.on("end", function(){
      //   res.end();
      // })
      res.download(filePath);
    }else { 
      res.send({status: 1, msg: 'file not exist!'});
    }
  })
})

// 上传测量仪器的路由
router.post('/manage/measure/upload', (req, res) => {
  const {measures} = req.body;
  let flag = true;
  measures.forEach(measure => {
    MeasureModel.update({_id: measure._id}, measure, {upsert: true})
      .catch(error => {
        flag = false;
      })
  });
  if(flag) {
    res.send({status: 0});
  }else {
    console.error('上传测量仪器异常', error);
    res.send({status: 1, msg: '上传测量仪器异常, 请重新尝试'});
  }
});

// 批量更新测量仪器的路由
router.post('/manage/measure/confirm', (req, res) => {
  const {measures} = req.body;
  let flag = true;
  measures.forEach(measure => {
    MeasureModel.update({_id: measure._id}, measure)
      .catch(error => {
        flag = false;
      })
  });
  if(flag) {
    res.send({status: 0});
  }else {
    console.error('批量测量仪器异常', error);
    res.send({status: 1, msg: '批量测量仪器异常, 请重新尝试'});
  }
});

module.exports = router;

const express = require('express');
const md5 = require('blueimp-md5');

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const UserModel = require('../models/UserModel');
const MeasureModel = require('../models/MeasureModel');
const SparePartModel = require('../models/SpartPartModel');
const RoleModel = require('../models/RoleModel');
const moment = require('moment');


const router = express.Router();

mongoose.set('useFindAndModify', false);

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
  MeasureModel.find({}, {__v: 0})
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

// 检查一个计量编号是否重复的路由
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
router.get('/manage/downloadTemplate', function(req, res) {
  const {type} = req.query;
  if(type === 'measure'){
    var fileName = '测量仪器模板.xlsx';
  }else if(type === 'spare-part'){
    var fileName = '备件采购模板.xlsx';
  }
      
  // let fileName = '测量仪器模板.xlsx';
  let filePath = path.join(__dirname, '../public/', fileName);

  fs.exists(filePath, function(exist){
    if(exist){
      let f = fs.createReadStream(filePath);
      // res.send({status: 0});
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=template.xlsx',
      });
      f.pipe(res);
    }else { 
      // console.log('file not exist!');
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

// 添加备件的路由
router.post('/manage/spare-part/add', (req, res) => {
  const sparePart = req.body;
  SparePartModel.create(sparePart)
    .then(sparePart => {
      res.send({status: 0, data: sparePart});
    })
    .catch(error => {
      console.error('添加备件失败', error);
      res.send({status: 1, msg: '添加备件失败, 请重新尝试'});
    });
});

// 获取备件列表的路由
router.get('/manage/spare-part/list', (req, res) => {
  const {start, end, username} = req.query;
  if(username === 'admin'){
    SparePartModel.find({$or: [{time: {$gte: start}, time: {$lte: end}}, {status: '未通过'}]}, {__v: 0})
    .then(spareParts => {
      res.send({status: 0, data: spareParts});
    })
    .catch(error => {
      console.error('获取备件列表异常', error);
      res.send({status: 1, msg: '获取备件列表异常，请重新尝试'});
    })
  }else {
    SparePartModel.find({$or: [{time: {$gte: start}, time: {$lte: end}}, {status: '未通过'}], commiter: username}, {__v: 0})
    .then(spareParts => {
      res.send({status: 0, data: spareParts});
    })
    .catch(error => {
      console.error('获取备件列表异常', error);
      res.send({status: 1, msg: '获取备件列表异常，请重新尝试'});
    })
  }
});

// 编辑备件的路由
router.post('/manage/spare-part/update', (req, res) => {
  const sparePart = req.body;
  console.log(sparePart);
  SparePartModel.findOneAndUpdate({_id: sparePart._id}, sparePart)
    .then(oldSparePart => {
      res.send({status: 0});
    })
    .catch(error => {
      console.error('更新备件失败', error);
      res.send({status: 1, msg: '更新备件失败, 请重新尝试'});
    });
});

// 上传备件的路由
router.post('/manage/spare-part/upload', (req, res) => {
  const {spareParts} = req.body;
  let flag = true;
  spareParts.forEach(sparePart => {
    SparePartModel.update({
      name: sparePart.name, 
      model: sparePart.model, 
      time: {$gte: moment().startOf('month').format('YYYY/MM/DD')},
      time: {$lte: moment().endOf('month').format('YYYY/MM/DD')}
    }, sparePart, {upsert: true})
      .catch(error => {
        flag = false;
      })
  });
  if(flag) {
    res.send({status: 0});
  }else {
    console.error('上传备件采购单异常', error);
    res.send({status: 1, msg: '上传备件采购单异常, 请重新尝试'});
  }
});

// 批量更新备件的路由
router.post('/manage/spare-part/confirm', (req, res) => {
  const {spareParts} = req.body;
  let flag = true;
  spareParts.forEach(sparePart => {
    SparePartModel.update({_id: sparePart._id}, {...sparePart, status: '审批通过'})
      .catch(error => {
        flag = false;
      });
  });
  if(flag) {
    res.send({status: 0});
  }else {
    console.error('批量备件通过异常', error);
    res.send({status: 1, msg: '批量备件通过异常, 请重新尝试'});
  }
});

// 增加角色的路由
router.post('/manage/role/add', (req, res) => {
  const {roleName} = req.body;
  RoleModel.create({name: roleName})
    .then(role => {
      res.send({status: 0, data: role});
    })
    .catch(err => {
      console.error('添加角色失败', error);
      res.send({status: 1, msg: '添加角色失败，请重新尝试'});
    });
});

// 获取角色列表的路由
router.get('/manage/role/list', (req, res) => {
  RoleModel.find({}, {__v: 0})  
    .then(roles => {
      res.send({status: 0, data: roles});
    }).catch(error => {
      console.error('获取角色列表失败', error);
      res.send({status: 1, msg: '获取角色列表失败，请重新尝试'});
    });
});

// 更新角色的路由
router.post('/manage/role/update', (req, res) => {
  const role = req.body;
  role.auth_time = Date.now();
  RoleModel.findOneAndUpdate({_id: role._id}, role)
    .then(oldRole => {
      // console.log(oldRole._doc);
      res.send({status: 0, data: {...oldRole._doc, ...role}});
      // res.send({status: 0});
    }).catch(error => {
      console.error('更新角色权限失败', error);
      res.send({status: 1, msg: '更新角色权限失败，请重新尝试'});
    });
});

// 获取用户列表的路由
router.get('/manage/user/list', (req, res) => {
  UserModel.find({}, {password: 0, _v: 0})
    .then(users => {
      RoleModel.find().then(roles => {
        res.send({status: 0, data: {users, roles}})
      })
      // res.send({status: 0, data: users});
    }).catch(error => {
      console.error('获取用户列表失败');
      res.send({status: 1, msg: '获取用户列表失败，请重新尝试'});
    })
});

// 添加用户的路由
router.post('/manage/user/add', (req, res) => {
  // 读取请求参数数据
  const {username, password} = req.body
  // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
  // 查询(根据username)
  UserModel.findOne({username})
    .then(user => {
      // 如果user有值(已存在)
      console.log(user);
      if (user) {
        // 返回提示错误的信息
        res.send({status: 1, msg: '此用户已存在'})
        return new Promise(() => {
        })
      } else { // 没值(不存在)
        // 保存
        return UserModel.create({...req.body, password: md5(password || username)})
      }
    })
    .then(user => {
      // 返回包含user的json数据
      console.log(user);
      res.send({status: 0, data: user})
    })
    .catch(error => {
      console.error('注册异常', error)
      res.send({status: 1, msg: '添加用户异常, 请重新尝试'})
    })
});

// 更新用户的路由
router.post('/manage/user/update', (req, res) => {
  const user = req.body;
  UserModel.findOneAndUpdate({_id: user._id}, {password: 0, __v: 0}, user)
    .then(oldUser => {
      // 用于对象的合并
      const data = Object.assign(oldUser, user)
      res.send({status: 0, data});
    })
    .catch(err => {
      console.error('更新用户失败', error);
      res.send({status: 1, msg: '更新用户失败，请重新尝试'});
    });
});

// 删除用户的路由
router.post('/manage/user/delete', (req, res) => {
  const {userId} = req.body;
  UserModel.deleteOne({_id: userId})
    .then((doc) => {
      res.send({status: 0})
    })
    .catch(error => {
      res.send({status: 1, msg: '删除用户失败'});
    });
});

module.exports = router;

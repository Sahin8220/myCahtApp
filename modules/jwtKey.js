var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var key = 'myChatAppKey2022';
var hash = crypto.createHash('sha256').update(key).digest('hex');

const encrypteKey = (data)=>
{
    return new Promise((resolve,reject)=>{
    jwt.sign(data, hash, function(err, token) {
        if(err) reject(err);
        resolve(token);
      });
    })
}


const decryptKey = (data)=>
{
    return new Promise((resolve,reject)=>{
        jwt.verify(data, hash, function(err, decoded) {
            if(err) reject(err);
            resolve(decoded);
        });
    })
}

const setCookieIfNotExists = (cookie,req,res)=>
{
  var cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    res.cookie(name,data, { maxAge: age});
    return true;
  } else {
    return true;
  } 
}
module.exports = { "encode": encrypteKey,"decode": decryptKey}
let db = require("./dbConnect").db;
const jwt = require('./jwtKey');
var crypto = require('crypto');
let socketClient = require("./clientio");

const loginChecker = (req,res,next)=>
{
    if ( req.path == '/login' || req.path == '/register' || req.path == '/makeLogin' || req.path == '/makeRegister' || req.path == '/isEmailExist') return next();
    let token = req.cookies.userLogin;
    if(token  === undefined)
    {
        res.redirect('/login');
    }
    else
    {
        jwt.decode(token)
        .then((data)=>{
            req.session.userData = data;
            next();
        })
        .catch(function() {
            res.redirect('/login');
        });
    }
   
}

const makeLogin = (req,res)=>
{
    let body = req.body;
    let pass = crypto.createHash('sha256').update(body.user_pass).digest('hex');
    var sql = db.prepare(`SELECT * FROM users WHERE email='${body.user_name}' AND user_pass='${pass}'`);
    console.log(body.user_name,pass);
    return new Promise(function(resolve,reject){
        sql.get((err, row) =>{
            if(err) res.redirect('/login?errStatus=3');
            if(row === undefined) res.redirect('/login?errStatus=3');
            if(row)
            {
                let data = {
                    user_name: row.user_name,
                    user_id: row.id,
                    logged_in: true
                }
                loginSaver(row.id);
                req.session.userData = data;
                resolve(jwt.encode(data));
            }
        });
    });
   
}

const makeRegister = (req)=>
{
    let body = req.body;
    let time = new Date().getTime();
    let pass = crypto.createHash('sha256').update(body.user_pass).digest('hex');
    var sql = db.prepare(`INSERT INTO users(user_name,email,user_pass,created_at,country,language) VALUES ('${body.user_name}','${body.user_mail}','${pass}','${time}','${body.country}','${body.language}')`);
    return new Promise(function(resolve,reject){
        sql.run((err) =>{
            if(err) reject(true);
            socketClient.notice(body.user_name + " Registered Now");
            resolve(true);
        });
    });
   
}

const loginSaver = (id)=>{
    let time = new Date().getTime().toString();
    var sql = db.prepare(`UPDATE users SET last_online = ${time} WHERE id = ${id}`);
    sql.run();
 }

 const checkMail = (req)=>{
     let mail = req.body.user_mail;
    var sql = db.prepare("SELECT id FROM users WHERE email='"+mail+"'");
    return new Promise(function(resolve,reject){
        sql.get((err, row) =>{
            if(err)reject(true);
            if(row){resolve(false)}else{reject(true)};
        });
    });
 }

 const userListGet = (id = null)=>{
    let where = "GROUP BY users.id";
    var sql = db.prepare("SELECT users.id,users.user_name,messages.message,MAX(messages.message_time) FROM users LEFT JOIN messages ON ((messages.send_from = users.id AND messages.send_to = "+id+") OR (messages.send_to = users.id  AND messages.send_from = "+id+")) "+where);
    return new Promise(function(resolve,reject){
        sql.all((err, rows) =>{
            resolve(rows);
        });
    });
 }

 const userDetails = (id)=>{
    var sql = db.prepare("SELECT users.id,users.user_name,created_at,country,language,email FROM users WHERE id = '"+id+"'");
    return new Promise(function(resolve,reject){
        sql.get((err, row) =>{
            if(err)reject(true);
            resolve(row);
        });
    });
 }
module.exports={"loginCheck" : loginChecker, "login": makeLogin, "get": userListGet, "register": makeRegister, "detail": userDetails, "checkMail":checkMail}
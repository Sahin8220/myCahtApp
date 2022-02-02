let db = require("./modules/dbConnect").db
let creator = require("./modules/dbCreator")
let events = require("./modules/eventSaver")
let userActions = require("./modules/userActions")
let messageActions = require("./modules/messageActions")
let socketServer = require("./modules/socketServer")
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(session({secret: Math.random().toString(16).slice(2),saveUninitialized: true,resave: true,cookie: { secure: true }}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(userActions.loginCheck);

app.get('/',async function (req, res) {
  let data = req.session.userData;
  console.log(req.session.userData)
  res.render('index', { title: 'Chat App Welcome',myUsername: data.user_name,mySockId: data.user_id});
});

app.post('/makeLogin',async function (req, res) {
  let data = await userActions.login(req,res);
  res.cookie("userLogin",data, { maxAge: 900000});
  res.redirect("/");
});

app.post('/saveMessage',async function (req, res) {
  messageActions.save(req);
  res.send("ok");
});

app.post('/makeRegister',async function (req, res) {
  try {
    userActions.register(req)
    .then(()=> res.redirect('/login?errStatus=1'))
  } catch (err) {
    res.redirect('/register?errStatus=3')
  }
});

app.post('/isEmailExist',async function (req, res) {
  try {
    let val = await userActions.checkMail(req)
    res.send(val);
  } catch (err) {
    res.send(err)
  }
});

app.get('/login',function (req, res) {
  res.render('login', { title: 'Chat App Login Page'});
});

app.get('/register',function (req, res) {
  res.render('register', { title: 'Chat App Register Page'});
});

app.get('/eventsList', async function (req, res) {
  res.json(await events.get())
});

app.get('/getUsersList', async function (req, res) {
  let data = req.session.userData;
  res.json(await userActions.get(data.user_id))
});

app.get('/getUsersList', async function (req, res) {
  let data = req.session.userData;
  res.json(await userActions.get(data.user_id))
});

app.get('/getMessages', async function (req, res) {
  let data = req.session.userData;
  res.json(await messageActions.get(data.user_id,req.query.id))
});

app.get('/getUserDetail', async function (req, res) {
  res.json(await userActions.detail(req.query.id))
});

app.get('/logout', async function (req, res) {
  req.session.destroy();
  res.clearCookie("userLogin");
  res.redirect('/login');
});

app.use(function (req, res, next) {
  res.status = 404;
  res.send("File Not Found")
});

app.listen(8080,async()=>
{
  creator();
  events.set("Chat System Alive",0);
  socketServer(app);
});
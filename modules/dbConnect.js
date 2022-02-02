var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/myChat.db');

exports.db = db;
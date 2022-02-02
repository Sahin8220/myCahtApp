let db = require("./dbConnect").db;
const dbCreator = ()=>{

db.serialize(function() {
  this.run('CREATE TABLE IF NOT EXISTS "users" ("id" INTEGER,"user_name" TEXT,"user_pass" TEXT,"last_online" TEXT,"created_at" TEXT,"country"	TEXT,PRIMARY KEY("id" AUTOINCREMENT))');
  this.run('CREATE TABLE IF NOT EXISTS "groups" ("id" INTEGER,"group_name" TEXT,"group_pic_url"	TEXT,"users" TEXT,PRIMARY KEY("id" AUTOINCREMENT))');
  this.run('CREATE TABLE IF NOT EXISTS "messages" ("id"	INTEGER,"send_from"	INTEGER,"send_to" INTEGER,"read_status" INTEGER,"read_users" TEXT,PRIMARY KEY("id" AUTOINCREMENT))');
  this.run('CREATE TABLE IF NOT EXISTS "events" ("id" INTEGER,"evet_descp" TEXT,"user_id" INTEGER,"event_time" TEXT,PRIMARY KEY("id" AUTOINCREMENT))');
});

}

module.exports = dbCreator;
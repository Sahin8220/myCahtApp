let db = require("./dbConnect").db;
const eventSaver = (descp,id)=>{
   let time = new Date().getTime().toString();
   var sql = db.prepare("INSERT INTO events(evet_descp,user_id,event_time) VALUES (?,?,?)");
   sql.run(descp,id,time);
}

const eventGet = (id = null)=>{
    var sql = db.prepare("SELECT * FROM events");
    let myrRow = [];
    return new Promise(function(resolve,reject){
        sql.all((err, rows) =>{
            resolve(rows);
        });
    });
 }

module.exports = {"set" : eventSaver,"get": eventGet};
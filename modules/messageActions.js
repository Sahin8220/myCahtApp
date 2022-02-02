let db = require("./dbConnect").db;
const messageSaver = (from,to,msg,time)=>{
   var sql = db.prepare("INSERT INTO messages(send_from,send_to,message,message_time) VALUES (?,?,?,?)");
   sql.run(from,to,msg,time);
}

const getMessage = (from,to)=>{
    var sql = db.prepare("SELECT * FROM messages WHERE (send_from = "+from+" AND send_to = "+to+") OR (send_from = "+to+" AND send_to = "+from+") ORDER BY message_time ASC");
    return new Promise(function(resolve,reject){
        sql.all((err, rows) =>{
            resolve(rows);
        });
    });
 }

module.exports = {"set" : messageSaver,"get": getMessage,"save":messageSaver};
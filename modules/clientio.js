const clientio = require("socket.io-client");
const socket = clientio("http://localhost:8081");
socket.on("connect", (err) => {
    socket.emit("login",{userName: "Admin", userId: 0});   
});
   

const noticeSender = (message)=>
{
    var myObj = {sender: "Admin",senderId: 0,msg: message};
    socket.emit("systemNotice",myObj);
}

module.exports = {"notice":noticeSender};
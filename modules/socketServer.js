let messageActions = require("./messageActions");
const createSocketServer = (app)=>{
const http = require('http').Server(app);
const io = require('socket.io')(http,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
	rejectUnauthorized : false,
	transports: ['polling']
});

let userList = [];
io.on('connection', (socket) => {
	socket.on('login', (userInfo) => {
        userInfo.socket = socket.id;
        userList.push(userInfo);
        io.emit('userList', userList);
	})
    
	socket.on('sendMsg', (data) => {
          messageActions.save(data.senderId,data.reciverId,data.message,data.time);
		  userList.forEach(item => {
			  if(item.userId == data.reciverId) socket.to(item.socket).emit('receiveMsg', data)
        });
        
	})

    socket.on('systemNotice', (data) => {
        if(data.senderId == 0)
        userList.forEach(item => {
            if(item.userId != data.senderId) socket.to(item.socket).emit('Notice', data)
      });
      
    })
    
    socket.on('disconnect', () => {
		var myId = userList.findIndex(p => p.socket == socket.id);
        io.emit('dcUser', userList[myId].userName);
        userList = userList.filter(item => item.socket != socket.id);
        setTimeout(() => {
            io.emit('userList', userList);
        }, 500);
        
    })
});
http.listen("8081", () => {
    console.log(`Socket.IO server running at http://localhost:8081/`);
  });
}

module.exports = createSocketServer;
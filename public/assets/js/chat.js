$(function() {
  'use strict';
  const socket = io("http://localhost:8081");
  socket.on("connect", () => {
  mySocketName = socket.id;
  socket.emit("login",{userName: myUsername, userId: mySockId})    
  });

  socket.on("Notice",(data)=>{
    toastr.info(data.msg);
    playNotification(2);
  });

  socket.on("dcUser",(data)=>{
    toastr.error(data+" went offline");
    playNotification(2);
  });

  socket.on("userList",(data)=>{
    clearStatuses().then(()=>{
      data.forEach(res => {
        $.get("/getUsersList",
          function (response) {
            response.forEach(element => {
            if(element.id!=mySockId && res.userId == element.id && $("#main-"+element.id).length == 0){ createChatList(element.user_name,element.id,element.message); toastr.success(element.user_name+" went online");playNotification(2);}
            if($("#main-"+element.id).length > 0 && data.findIndex(p => p.userId == element.id) < 0){  $("#main-"+element.id).remove();};
            });
          }
        );
      });
      myUserList=data;
    })
  });

  socket.on("receiveMsg",(data)=>{
    if(data.senderId == activeChat)
    {
      createMessage(data.message,new Date().getTime(),1,data.senderId);
      $(`#message-${data.senderId}`).html(data.message.substr(0,35));
      $(`#main-${data.senderId}`).prependTo('.messages-box');
      playNotification(1);
      scrollToBottom("chatcontainer");
    }
    else
    {
      createBadge(data.senderId);
      $(`#message-${data.senderId}`).html(data.message.substr(0,35));
      $(`#main-${data.senderId}`).prependTo('.messages-box');
      notifyMe(data.message,data.sender,data.senderId)
      playNotification(0);
    }
  });

  $("#sendMessage").click(function (e) { 
    e.preventDefault();
    sendSocketMessage(socket);
  });
  
  $('#replyArea').keypress(function (e) {    
    var key = e.which;
    if(key == 13  && !e.shiftKey && $("#replyArea").val() != "")  
     {
       e.preventDefault();
       $('#sendMessage').click();
     }
   });
   $('input[type=text]').emoji();
});

function scrollToBottom (id) {
  var div = document.getElementById(id);
  if(div) div.scrollTop = div.scrollHeight - div.clientHeight;
}

function clearStatuses() {
  return new Promise((resolve)=>{
  document.querySelectorAll("small").forEach(element => {
    element.innerHTML="";
  });
  resolve(true);
})
}
function notifyMe(data,user,id) {
  if (Notification.permission !== 'granted')
      Notification.requestPermission();
  else {
   var notification = new Notification(user+' Kişisinden Yeni Mesaj', {
    icon: "https://avatars.dicebear.com/api/human/aaa.svg",
    body: data,
   });
   notification.onclick = function() {
     var myChat = $("#main-"+id);
                  if (myChat.length)
                      myChat.trigger("click");
                      scrollToBottom("chatcontainer");
                
   };
  }
 }


function createChatList(name,id,message)
{
  let maindiv = $("<div>", {id: `main-${id}`, "class": "list-group  rounded-0"}).click(function (e) { selectChat(this.id) });
  let secondiv = $("<div>", {id: `cont-${id}`,"class": "list-group-item list-group-item-action rounded-0"});
  let mediadiv = $("<div>", {"class": "media"});
  let avatar = $("<img>", {"class": "rounded-circle","width": 50, "src": "https://ui-avatars.com/api/?name="+name});
  let bodyDiv = $("<div>", {"class": "media-body ml-4"});
  let userDiv = $("<div>", {"class": "d-flex align-items-center justify-content-between mb-1"});
  let nameDiv = $("<h6>", {"class": "mb-0"});
  nameDiv.text(name)
  let statusDiv = $("<small>", {id: `status-${id}`,"class": "small font-weight-bold"});
  let messagediv = $("<p>", {id: `message-${id}`,"class": "font-italic mb-0 text-small"});
  messagediv.text(message === null ? "Click for Send Message":message.substr(0,35)+"...");
  maindiv.append(secondiv);
  secondiv.append(mediadiv);
  mediadiv.append(avatar);
  mediadiv.append(bodyDiv);
  bodyDiv.append(userDiv);
  userDiv.append(nameDiv);
  userDiv.append(statusDiv);
  bodyDiv.append(messagediv);
  $(".messages-box").append(maindiv);
}

function createMessage(message,time,side,id = null)
{
  let recIndex = myUserList.findIndex(p => p.userId == id);
  let myPic = recIndex < 0 ? "" : myUserList[recIndex].userName;
  var date = new Date(time);
  var margin = side == 0 ? "ml-auto" : "";
  var color = side == 0 ? "bg-primary" : "bg-light";
  var messageMargin = side == 0 ? "text-white" : "text-muted";
  var textSide = side == 0 ? "mb-0" : "";
  let maindiv = $("<div>", {"class": "media w-50 "+margin+" mb-3"});
  let secondiv = $("<div>", {"class": "media-body "+textSide});
  let mediadiv = $("<div>", {"class": color+" rounded py-2 px-3 mb-2"});
  let avatar = $("<img>", {"class": "rounded-circle","width": 50, "src": "https://ui-avatars.com/api/?name="+myPic});
  let statusDiv = $("<small>", {"class": "small text-muted"});
  let messagediv = $("<p>", {"class": "text-small mb-0 "+messageMargin+""});
  messagediv.text(message);
  statusDiv.text(getTimeHourMinute(date));
  side == 1 ? maindiv.append(avatar) : "";
  maindiv.append(secondiv);
  secondiv.append(mediadiv);
  mediadiv.append(messagediv);
  secondiv.append(statusDiv);
  $(".chat-box").append(maindiv);
}


function selectChat(id)
{
  if(activeChat == id.split("-")[1]) return false;
  clearChatArea().then(()=>{
  $(".input-group").css("display","flex");
  $(".active").removeClass("text-white active");
  $(`#${id} > div`).addClass("text-white active");
  activeChat = id.split("-")[1];
  $(`#status-${activeChat}`).html("");
  createTopBar($(`#cont-${activeChat}`).find("h6").text(),activeChat);
  console.log($(`#cont-${activeChat}`).find("h6").text())
  $.get("/getMessages",{id: id.split("-")[1]},
  function (data) {
    data.forEach(element => {
      if(element.send_from!=mySockId)createMessage(element.message,element.message_time,1,element.send_from);
      if(element.send_from==mySockId)createMessage(element.message,element.message_time,0);
    });
    scrollToBottom("chatcontainer");
  }
);
});
}

function getTimeHourMinute(mydate = null) {
  var date = mydate==null ? new Date : mydate;
  var seconds = date.getSeconds();
  var minutes = date.getMinutes();
  var hour = date.getHours();
  return date.toDateString()+" "+hour+":"+minutes;
}

function clearChatArea() {
  return new Promise((resolve)=>{
    $("#chatcontainer").html("");
    resolve(true);
  })
}

function playNotification(id) {
  var notificationSources = ["assets/notifications/messagealert.mp3","assets/notifications/notification.mp3","assets/notifications/notice.mp3"]
  var msjses = new Audio(notificationSources[id]);
  msjses.play();
}

function createBadge(id) {
  var count = $("#status-"+id+" > span").length > 0 ? parseInt($("#status-"+id+" > span").text()) + 1 : 1;
  $("#status-"+id+"").html(`<span class="badge badge-danger">${count}</span>`);
}

function sendSocketMessage(socket)
 {
    
    let recIndex = myUserList.findIndex(p => p.userId == activeChat);
    if(recIndex >= 0){
        var myObj = {id: myUserList[recIndex].socket,sender: myUsername,senderId: mySockId,reciver: myUserList[recIndex].userName,reciverId:myUserList[recIndex].userId,message: $("#replyArea").val(), time: new Date().getTime()};
        socket.emit("sendMsg",myObj);
        createMessage($("#replyArea").val(),new Date().getTime(),0);
        $(`#message-${myUserList[recIndex].userId}`).html($("#replyArea").val().substr(0,35));
        $("#replyArea").val("");
        scrollToBottom("chatcontainer");
    }
    else
    {
      saveMessageToDb(mySockId,activeChat,$("#replyArea").val());
      $("#replyArea").val("");
    }
 }

function saveMessageToDb(from,to,msg) {
  let time = new Date().getTime();
  $.ajax({
    type: "POST",
    url: "/saveMessage",
    data: {from: from,to:to,msg:msg,time:time},
    success: ()=> createMessage(msg,time,0),
  });
}

function createTopBar(name,id) {
  $(".statDiv").html("");
  let first = $("<div>", {"class": "infoContainer"});
  let par = $("<p>").text(name);
  let icon = $("<i>", {"class": "fa fa-user-plus"});
  let mediadiv = $("<button>", {"class": "btn btn-link"}).click((e)=>{ e.preventDefault(); $("#userModal").modal("show"); userModal(id)});
  let avatar = $("<img>", {"class": "rounded-circle","width": 50, "src": "https://ui-avatars.com/api/?name="+name});
  first.append(avatar);
  first.append(par);
  mediadiv.append(icon);
  $(".statDiv").append(first);
  $(".statDiv").append(mediadiv);
}

function userModal(id) {
  $.get("/getUserDetail",{id:id},
  function (response) {
      $("#modTitle").text(response.user_name+" Details");
      $("#Uname").text(response.user_name);
      let date = new Date(response.created_at);
      $("#regDate").text(getTimeHourMinute(date));
      $("#Ucountry").text(response.country);
      $("#Umail").text(response.email);
      $("#Ulang").text(response.language);
    }
  );
}
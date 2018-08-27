var io = require("socket.io-client");

var fs = require('fs');
var ini = require('ini');


//读取用户信息
var userInfo = process.argv.splice(2);
//var url = "wss://pdk.pkgame.net:8641";
var url = "wss://pdk-dev.pkgame.net:8641";


var socket = io.connect(url);

var ticket= userInfo[1];
var uid= userInfo[0];

console.log("uid: " ,uid)
console.log("ticket: " ,ticket)
var msgId = 1;
var route = "";
var body = {};


//命令类型
if (typeof CommandType == "undefined") {
    var CommandType = {
        COMMAND_TYPE_AUTH: 1,
        COMMAND_TYPE_LOGIN: 2,
        COMMAND_TYPE_CREATE_ROOM: 3,
        COMMAND_TYPE_EXIT_ROOM: 4,
        COMMAND_TYPE_ADD_GOLD: 5,
        COMMAND_TYPE_READY_PLAY: 6,
        COMMAND_TYPE_START_PLAY: 8,
        COMMAND_TYPE_ENABLE_ROBOT: 7
    };
}

//socket 返回消息
socket.on('message', function (d) {
    console.log("message", d); 
    var messageData = JSON.parse(d);
    console.log("messageID:", messageData.id);

    switch (messageData.id){
        case CommandType.COMMAND_TYPE_AUTH:

            break;
        case CommandType.COMMAND_TYPE_LOGIN:
            break;
        case CommandType.COMMAND_TYPE_ADD_GOLD:
            readyPlay();
            break;
        case CommandType.COMMAND_TYPE_READY_PLAY:
            break;
        case CommandType.COMMAND_TYPE_ENABLE_ROBOT:
            break;
        default:
            break;
    }   
    if (messageData && messageData['route']){
        switch (messageData['route']) {
            case "higher":
                readyPlay();
                break;
            case "onGameOver":
                setTimeout(function() {
                readyPlay();
                readyPlay();
                }, 1500)
                break;
            case "onDealCards":
	        startPlay();
                break;
            case "toPlayCards":
                enableRobot();
                break;
         }
     }
});

socket.on('connect', function () {
    console.log('connect'); //连接成功

    Main();
});


//用户授权
function auth() {
    msgId = CommandType.COMMAND_TYPE_AUTH;
    route = "connector.entryHandler.enter";
    body = {"uid": uid, "areaId": "area-1027", "timestamp": 1531210085714};
    console.log(body);
    console.log("encodeMsg");
    encodeMsg(msgId, route, body);
}


//用户登录
function sendSignUser() {
    var msgId = CommandType.COMMAND_TYPE_LOGIN;
    var route = "game.gameHandler.request";
    var body = {
        "action": "signUser",
        "data": {"areaId": "area-1027", "invoker": "pdk", "ticket": ticket},
        "timestamp": 1531211209701
    };
    console.log("sendSignUser");
    encodeMsg(msgId, route, body);
}

// 创建房间 crete
function createRoom() {
    console.log("createRoom");
    var msgId = CommandType.COMMAND_TYPE_CREATE_ROOM;
    var route = "game.gameHandler.request";
    var body = {
        "action": "createRoom",
        "data": {
            "field": {
                "type": "private",
                "roundUsersLimit": "3",
                "roundCountLimit": "8",
                "firstPlaySpade3": false,
                "roomCardCount": 2,
                "showCardsCount": false
            }
        },
        "timestamp": 1531214639239
    };
    encodeMsg(msgId, route, body);
}

//发牌结束
function startPlay(){
    console.log("startPlay")
    var msgId = CommandType.COMMAND_TYPE_START_PLAY;
    var route = "game.gameHandler.request";
    var body = {"action": "startPlay", "timestamp": 1531214756430};
    encodeMsg(msgId, route, body)
}

// 退出房间 crete
function exitRoom() {
    console.log("exitRoom");
    var msgId = CommandType.COMMAND_TYPE_EXIT_ROOM;
    var route = "game.gameHandler.request";
    var body = {"action": "leaveRoom", "timestamp": 1531214756430};
    encodeMsg(msgId, route, body);
}

//加入金币场
function addGoldRoom() {
    console.log("addGoldRoom");
    var msgId = CommandType.COMMAND_TYPE_ADD_GOLD;
    var route = "game.gameHandler.request";
    var body = {"action": "enterRoom", "data": {"fieldType": "higher", "password": null}, "timestamp": 1531214834923};
    encodeMsg(msgId, route, body);
}

function enableRobot() {
    console.log("enableRobot");
    var msgId = CommandType.COMMAND_TYPE_ENABLE_ROBOT;
    var route = "game.gameHandler.request";
    var body = {"action": "enableAgent", "data": {"enabled": true}, "timestamp": 1533713064118};
    encodeMsg(msgId, route, body);
}

function readyPlay() {
    console.log("readyPlay");
    var msgId = CommandType.COMMAND_TYPE_READY_PLAY;
    var route = "game.gameHandler.request";
    var body = {"action": "readyPlay", "timestamp": 1533713064118};
    encodeMsg(msgId, route, body);
}


function encodeMsg(msgId, route, body) {
    var str = encode(msgId, route, body);
    send(str);
}

function close() {
   socket.disconnect();
}

socket.on('disconnect', (reason) => {
    console.log('disconnect');
    // ...
});
//注册行为方法  !!!!!!!!修改行为
var registerFunction = [auth, sendSignUser, addGoldRoom];
//var registerFunction = [auth, sendSignUser, addGoldRoom, isReadyPlay, isEnableRobot];
var registerTime = [1, 1000, 1000];
var index = 0;

//以队队列表形式，间隔每秒执行一个方法。
function Main() {
    setTimeout(function () {
        if (index < registerFunction.length) {
            var fun = registerFunction[index];
            fun();
            index++;
        }
        Main();
    }, registerTime[index]);
//     auth();
//     setTimeout(function(){
//         sendSignUser(CommandType.COMMAND_TYPE_LOGIN);
//     },1000)
}


var send = function (packet) {
    if (!!socket) {
        socket.send(packet.buffer || packet, {binary: true, mask: true}, function (data) {

            console.log(data);
        });
    }
};

function encode(id, route, msg) {
    var HEADER = 5;
    var msgStr = JSON.stringify(msg);
    if (route.length > 255) {
        throw new Error('route maxlength is overflow');
    }
    var byteArray = new Uint16Array(HEADER + route.length + msgStr.length);
    var index = 0;
    byteArray[index++] = (id >> 24) & 0xFF;
    byteArray[index++] = (id >> 16) & 0xFF;
    byteArray[index++] = (id >> 8) & 0xFF;
    byteArray[index++] = id & 0xFF;
    byteArray[index++] = route.length & 0xFF;
    for (var i = 0; i < route.length; i++) {
        byteArray[index++] = route.charCodeAt(i);
    }
    for (var i = 0; i < msgStr.length; i++) {
        byteArray[index++] = msgStr.charCodeAt(i);
    }
    return bt2Str(byteArray, 0, byteArray.length);
};


var bt2Str = function (byteArray, start, end) {
    var result = "";
    for (var i = start; i < byteArray.length && i < end; i++) {
        result = result + String.fromCharCode(byteArray[i]);
    }
    ;
    return result;
}

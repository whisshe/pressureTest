var io = require("socket.io-client");

var fs = require('fs')
var obj =JSON.parse(fs.readFileSync("user.json", "UTF-8"));

var url = "wss://pdk.pkgame.net:8641";
var socket = io.connect(url);

var msgId = 1;
var route = "";
var body = {};

//命令类型
if (typeof CommandType == "undefined") {
    var CommandType = {
        COMMAND_TYPE_AUTH: 1,
        COMMAND_TYPE_LOGIN: 2,
        COMMAND_TYPE_ADD_GOLD: 3,
        COMMAND_TYPE_READY_PLAY: 4,
        COMMAND_TYPE_ENABLE_ROBOT: 5
    };
}

//socket连接
socket.on('connect', function () {
    console.log('connected');//connect success
    Main();
});

//编码
function encodeMsg(msgId, route, body) {
    var str = encode(msgId, route, body);
    send(str);
}


//获取用户的uuid和ticket
function getUserInfo(){
for(j = 0; j < obj.length; j++) {
    var ticket=JSON.stringify(obj[j].ticket);
    var uuid=JSON.stringify(obj[j].uuid);
    var r = j%3 
       if (r == 0){
           console.log("first user");
       }
       else if(r == 1){
           console.log("second user");
        }
       else if(r == 2){
           console.log("third user");
        }
    console.log(j,"uuid: ", uuid);
    console.log(j,"ticket: ", ticket);
    }
}

var ticket=JSON.stringify(obj[0].ticket);
var uuid=JSON.stringify(obj[0].uuid);

//用户授权
function auth() {
    msgId = CommandType.COMMAND_TYPE_AUTH;
    route = "connector.entryHandler.enter";
    body = {"uid": uuid, "areaId": "area-1027", "timestamp": 1531210085714};
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

//加入金币高级场
function addGoldRoom() {
    console.log("addGoldRoom");
    var msgId = CommandType.COMMAND_TYPE_ADD_GOLD;
    var route = "game.gameHandler.request";
    var body = {"action": "enterRoom", "data": {"fieldType": "beginner", "password": null}, "timestamp": 1531214834923};
    encodeMsg(msgId, route, body);
}

//准备
function readyPlay() {
    console.log("readyPlay");
    var msgId = CommandType.COMMAND_TYPE_READY_PLAY;
    var route = "game.gameHandler.request";
    var body = {"action": "readyPlay", "timestamp": 1533713064118};
    encodeMsg(msgId, route, body);
}

//判断是否发牌

//托管
function enableRobot() {
    console.log("enableRobot");
    var msgId = CommandType.COMMAND_TYPE_ENABLE_ROBOT;
    var route = "game.gameHandler.request";
    var body = {"action": "enableAgent", "data": {"enabled": true}, "timestamp": 1533713064118};
    encodeMsg(msgId, route, body);
}

//判断是否牌局结束

//退出房间
function exitRoom() {
    console.log("exitRoom");
    var msgId = CommandType.COMMAND_TYPE_EXIT_ROOM;
    var route = "game.gameHandler.request";
    var body = {"action": "leaveRoom", "timestamp": 1531214756430};
    encodeMsg(msgId, route, body);
}

//注册行为方法
var registerFunction = [auth, sendSignUser, addGoldRoom, readyPlay, enableRobot];
var registerTime = [1, 1000, 1000, 3000, 3000, 3000];
var index = 0;

//以队列形式，间隔时间执行一个方法
function Main() {
    setTimeout(function () {
        if (index < registerFunction.length) {
            var fun = registerFunction[index];
            fun();
            index++;
        }
        Main();
    }, registerTime[index]);
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
//关闭ws连接
//getUserInfo()

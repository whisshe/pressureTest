var io = require("socket.io-client");

var fs = require('fs');
var ini = require('ini');

//加载配置
var Info = ini.parse(fs.readFileSync("ddz.ini", 'UTF-8'));


var url = Info.url+":"+Info.port;
console.log(url);
var socket = io.connect(url);

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
        COMMAND_TYPE_ADD_GOLD: 5
    };
}
var cmdIndex = 0;

socket.on('connect', function () {
    console.log('connect'); //连接成功

    Main();
});

//监控返回消息 !!! 修改要监控的内容。
socket.on('message', function (d) {
    console.log("message", d);
    var messageData = JSON.parse(d);
    console.log("messageID:", messageData.id);

    switch (messageData.id){
        case CommandType.COMMAND_TYPE_AUTH:
            //处理
            break;
        case CommandType.COMMAND_TYPE_LOGIN:
            loginOperate(messageData);
            break;
//        case CommandType.COMMAND_TYPE_CREATE_ROOM:
//            break;
//        case CommandType.COMMAND_TYPE_EXIT_ROOM:
//            break;
        case CommandType.COMMAND_TYPE_ADD_GOLD:
            cmdIndex = CommandType.COMMAND_TYPE_ADD_GOLD;
            readyOperate();
            break;
       default:
           console.log("default..........");
           break;
    }
    if (messageData && messageData['route']){
        switch (messageData['route']) {
            case "onGameOver":
                onGameOver(messageData);
                break;
        }
    }
});

function onGameOver(data){
   //处理打牌结束的消息
    //readyOperate();
}

function readyOperate(){
    msgId = cmdIndex+1;
    route = "connector.entryHandler.enter";
    body = {"uid": "736bc9635dc57a77800009b9d5219006", "areaId": "area-1027", "timestamp": 1531210085714};
    console.log("encodeMsg");
}

function loginOperate(d) {
    addGoldRoom();

}

//用户授权
function auth() {
    msgId = CommandType.COMMAND_TYPE_AUTH;
    route = "connector.entryHandler.enter";
    body = {"uid": "736bc9635dc57a77800009b9d5219006", "areaId": "area-1027", "timestamp": 1531210085714};
    console.log("encodeMsg");
    encodeMsg(msgId, route, body);
}


//用户登录
function sendSignUser() {
    var msgId = CommandType.COMMAND_TYPE_LOGIN;
    var route = "game.gameHandler.request";
    var body = {
        "action": "signUser",
        "data": {"areaId": "area-4956", "invoker": "ddz", "ticket": "6440RIBKAPKSLKCQ77D7"},
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
                "bottomChips": "1",
                "roundTimesLimit": "12",
                "roundCountLimit": "8",
                "roomCardCount": 2,
            }
        },
        "timestamp": 1531214639239
    };
    encodeMsg(msgId, route, body);
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
    var body = {"action": "enterRoom", "data": {"fieldType": "beginner", "password": null}, "timestamp": 1531214834923};
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
// var registerFunction = [auth, sendSignUser, createRoom, exitRoom, addGoldRoom, close];
// var registerTime = [1, 1000, 1000, 1000, 2000, 2000];
// var index = 0;

//以队队列表形式，间隔每秒执行一个方法。
function Main() {
    // setTimeout(function () {
    //     if (index < registerFunction.length) {
    //         var fun = registerFunction[index];
    //         fun();
    //         index++;
    //     }
    //     Main();
    // }, registerTime[index]);

    auth();
    setTimeout(function(){
        sendSignUser(CommandType.COMMAND_TYPE_LOGIN);
    }, 1000)

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

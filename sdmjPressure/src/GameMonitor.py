import websocket
import _thread
import time
import os

from color import color
from timeout_decorator import timeout
from src.Public import Public
from src.Config import Config
import threading


class WsClient(threading.Thread):

    def __init__(self, invoker, uuid, ticket, semlock):
        threading.Thread.__init__(self)
        self.semLock = semlock
        envPath = "{}{}".format(os.getcwd(), "/.env")
        config = Config(envPath)
        self.pb = Public()
        self.login = eval(config.get(invoker, "login"))
        self.login['uuid'] = uuid
        self.login['ticket'] = ticket
        self.login = str(self.login).replace('\'', '\"')

        self.invoker = invoker
        self.uuid = uuid
        self.gameCount = 1

        self.logFile = "{}/{}.log".format(os.getcwd(), invoker)
        self.loginStatus = config.get(invoker, "loginStatus")
        self.roomRemove = config.get(invoker, "roomRemove")
        self.coinMatch = config.get(invoker, "coinMatch")
        self.ready = config.get(invoker, "ready")
        self.gameStart = config.get(invoker, "gameStart")
        self.gameOver = config.get(invoker, "gameOver")
        self.roomJoin = config.get(invoker, "roomJoin")
        self.enableRobot = config.get(invoker, "enableRobot")
        self.exit = config.get(invoker, "exit")
        self.wsUrl = config.get(invoker, "wsUrl")

    def run(self):
        self.connect()

    def on_message(self, ws, message):
        if message.find(self.loginStatus) != -1:
            goCount = color.red("{} {}登陆".format(self.invoker, self.uuid))
            self.pb.gameLogAddToFile(goCount, self.logFile)
            self.pb.gameLogAddToFile(message, self.logFile)
            ws.send(self.coinMatch)
        elif message.find(self.roomJoin) != -1:
            self.pb.gameLogAddToFile(message, self.logFile)
            ws.send(self.ready)
        elif message.find(self.gameStart) != -1:
            self.pb.gameLogAddToFile(message, self.logFile)
            ws.send(self.enableRobot)
        elif message.find(self.roomRemove) != -1:
            self.pb.gameLogAddToFile(message, self.logFile)
            ws.send(self.coinMatch)
        elif message.find(self.gameOver) != -1:
            goCount = color.red("{} {} 第{}局游戏结束".format(self.invoker, self.uuid, self.gameCount))
            self.pb.gameLogAddToFile(goCount, self.logFile)
            self.pb.gameLogAddToFile(message, self.logFile)
            self.gameCount = self.gameCount + 1
            ws.send(self.ready)
        elif self.gameCount == 3:
            ws.close()
            self.releaseThread()
        else:
            self.pb.gameLogAddToFile(message, self.logFile)

    def on_error(self, ws, error):
        print(error)

    def on_close(self, ws):
        # print("### closed ###")
        pass

    def on_open(self, ws):
        ws.send(self.login)

    # @timeout(5)
    def connect(self):
        websocket.enableTrace(True)
        ws = websocket.WebSocketApp(self.wsUrl,
                                    on_message=self.on_message,
                                    on_error=self.on_error,
                                    on_close=self.on_close)
        ws.on_open = self.on_open
        ws.run_forever()

    def sendLogin(self, ws, message):
        self.pb.color("login......", "cyan")
        lss = self.pb.find(self.loginStatus, message)
        # login success
        while lss is True:
            self.sendCoinMatch(ws, message)

    def sendCoinMatch(self, ws, message):
        ws.send(self.coinMatch)
        self.pb.color("join coinMatch......", "cyan")
        cms = self.pb.find(self.roomJoin, message)
        # room join success
        while cms is True:
            self.sendReady(ws, message)

    def sendReady(self, ws, message):
        ws.send(self.ready)
        self.pb.color("start play......", "cyan")
        rs = self.pb.find(self.gameStart, message)
        #  game Start
        while rs is True:
            self.sendEnableRobot(ws, message)

    def sendEnableRobot(self, ws, message):
        ws.send(self.enableRobot)
        self.pb.color("enableRobot......", "cyan")
        ers = self.pb.find(self.gameOver, message)
        # game over
        while ers is True:
            self.sendGameOver(ws, message)

    def sendGameOver(self, ws, message):
        self.pb.color("next game......", "cyan")
        self.sendReady(ws, message)

    def releaseThread(self):
        self.semLock.release()

# if __name__ == "__main__":
#     config = Config(".env")
#     for invoker in config.cf.sections():
#         wc = WsClient(invoker)
#         print("### {} connect ###".format(invoker))
#         wc.connect(wc.wsUrl)
#         print("### {} closed ###".format(invoker))

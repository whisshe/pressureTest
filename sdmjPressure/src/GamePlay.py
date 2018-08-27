from src.Public import Public


class GamePlay(object):
    def __init__(self, status, message):
        self.pb = Public()
        self.status = status
        self.message = message

    def login(self):
        self.pb.color("login......", "cyan")
        lss = self.pb.find(self.status, self.message)
        # login success
        while lss is True:
            self.coinMatch()

    def coinMatch(self):
        self.pb.color("join coinMatch......", "cyan")
        cms = self.pb.find(self.status, self.message)
        # room join success
        while cms is True:
            self.ready()

    def ready(self):
        self.pb.color("ready play......", "cyan")
        rs = self.pb.find(self.status, self.message)
        # ready success
        while rs is True:
            self.enableRobot()

    def enableRobot(self):
        self.pb.color("enableRobot......", "cyan")
        ers = self.pb.find(self.status, self.message)
        #
        while ers is True:
            self.gameOver()

    def gameOver(self):
        self.pb.color("gameOver......","cyan")
        gos = self.pb.find(self.status,self.message)
        while gos is True:
            pass

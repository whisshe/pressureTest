import json
import traceback
import os


class Public():
    def jsonDumpAddToFile(self, dict, file):
        jd = json.dumps(dict)
        af = open(file, 'a')
        af.write(jd + "\n")
        af.close()

    def gameLogAddToFile(self, message, file):
        fp = open(file, "a")
        fp.write(message + "\n")
        fp.close()

    def exceptionMessage(self, Exception):
        print('str(Exception):\t', str(Exception))
        print('str(e):\t\t', str(Exception))
        print('repr(e):\t', repr(Exception))
        print('traceback.print_exc():', traceback.print_exc())
        print('traceback.format_exc():\n%s' % traceback.format_exc())
        print('########################################################')

    def color(self, text, color):
        colorDict = {"red": 1, "green": 2, "yellow": 3, "blue": 4, "cyan": 6}
        colorNum = colorDict.get(color)
        output = "\033[0;3{};48m{}\033[0m".format(colorNum, text)
        return output

    def getUserInfo(self, userFile):
        file = open(userFile)
        uf = json.load(file)
        return uf

    def find(self, str, text):
        result = text.find(str)
        if result == -1:
            return False
        return True

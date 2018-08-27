# -*- coding:utf-8 -*-

import sys, os, time
import configparser


class Config(object):

    def __init__(self, path):
        self.path = path
        self.cf = configparser.ConfigParser()
        try:
            self.cf.read(self.path)
        except:
            print("read error")

    def get(self, field, key):
        result = ""

        try:
            result = self.cf.get(field, key)
        except:
            result = ""
        return result

    def set(self, field, key, value):
        try:
            self.cf.set(field, key, value)
            self.cf.write(open(self.path, "w"))
        except:
            return False
        return True

    def readConfig(self, configPath, field, key):
        cf = configparser.ConfigParser()
        try:
            cf.read(configPath)
            result = cf.get(field, key)
        except:
            sys.exit(1)

        return result

    def writeConfig(self, configPath, field, key, value):
        cf = configparser.ConfigParser()
        try:
            cf.read(configPath)
            cf.set(field, key, value)
            cf.write(open(configPath, 'w'))
        except:
            sys.exit(1)
        return True

#envPath = "{}{}".format(os.getcwd(), "/.env")
#print(envPath)
#configSingleton = Config(envPath)

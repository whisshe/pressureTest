# -*- coding: utf-8 -*-
# llr
# 2018-6-19 17:00
import _thread
import threading
from sys import argv
import os

from src.GameMonitor import WsClient
from src.Public import Public


def main():
    # invoker = argv[1]
    maxThread = 1000
    semLock = threading.BoundedSemaphore(maxThread)
    invoker = "sdmj"
    pb = Public()
    uf = pb.getUserInfo("{}{}".format(os.getcwd(), "/user.json"))
    for key in uf:
        semLock.acquire()
        uuid = key.get('uuid')
        ticket = key.get('ticket')
        gm = WsClient(invoker, uuid, ticket, semLock)
        gm.start()


if __name__ == "__main__":
    main()

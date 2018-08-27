#!/bin/bash
# 修改压测用户数量和线程数量

pwd=`pwd`
TestUser=$pwd/TestUser.json
userFile=$pwd/user.json
Moni=$pwd/Monitor.py

modifyUserNum(){
    read -p "how many users you want: " userNum
    deleteLines=$((`cat $userFile|wc -l` -2))
    [[ $deleteLines -le 3 ]]|| sed -i "2,${deleteLines}d" $userFile
    getRandomNum $userNum 4500
    cat $TestUser|head -n $randomNum|tail -n $userNum > tmp
    cat tmp|while read line;do
        sed -i "1a\\$line" $userFile
    done
}

getRandomNum(){
    min=$1
    max=$2
    num=$(date +%s%N)
    randomNum=$((num%max+min))
}

modifyThread(){
    read -p "how many threads you want: " threads
    sed -i "/maxThread = /c maxThread = $threads" $Moni
    sed -i "s/^maxThread/    maxThread/" $Moni
}
modifyUserNum
modifyThread

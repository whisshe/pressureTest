#!/bin/bash
# pressureTest  control

jq=`which jq`
pwd=`pwd`
#userInfoFile=$pwd/user.json
#userInfoFile=$pwd/TestUser.json
userFile=$1

getUserInfo(){
    num=$1
#    uid=`cat $userInfoFile|jq .[$num].uuid|awk -F[\"\"] '{print $2}'`
#    ticket=`cat $userInfoFile|jq .[$num].ticket|awk -F[\"\"] '{print $2}'`
    uid=`cat $userFile|awk -v num=$num -F [\"\"] 'NR==num{print $4}'`
    ticket=`cat $userFile|awk -v num=$num -F [\"\"] 'NR==num{print $2}'`
}

color(){
    color=$1
    text=$2
    case $color in
        red)
            echo -e "\033[31m $text\033[0m"
        ;;
        green)
            echo -e "\033[32m $text\033[0m"
        ;;
        yellow)
            echo -e "\033[33m $text\033[0m"
        ;;
        blue)
            echo -e "\033[34m $text\033[0m"
        ;;
        purple)
            echo -e "\033[35m $text\033[0m"
        ;;
        cyan)
            echo -e "\033[36m $text\033[0m"
        ;;
        white)
            echo -e "\033[37m $text\033[0m"
        ;;
        *)
            echo ' input error'
        ;;
    esac
}

getUserNum(){
    lines=`cat -n $userInfoFile|awk '{print $1}'|tail -n1`
    num=$((lines-2))
    color blue "there are $num users"
}
control(){
   for ((n=0;n<num;n++));do
        {
        echo "n is $n  num is $num"
        getUserInfo $n
        node $pwd/pdk.js $uid $ticket >> /tmp/pressureTest/pressure.log
        #echo "nohup node $pwd/pdk.js $uid $ticket  >> pressure.log 2>&1 &" >> a.sh
        }&
    done
}

getUserNum
control

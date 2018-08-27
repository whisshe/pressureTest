#!/bin/bash
# send pressureTest script to all hosts

file=pressure.tar.gz

declare -A U_H_dict
U_H_dict=([gameb]="xab" [gamec]="xac" [gamed]="xad" [apia]="xae" [apix]="xaf" [www]="xag" [servicea]="xah" [xkdev]="xai")
send(){
    scp $file root@$host:/tmp/
}

remoteExec(){
    ssh root@$host "cd /tmp;tar zxvf $file"
    echo 1 > /proc/sys/vm/drop_caches
    ssh root@$host "cd /tmp/pressureTest;./control.sh USER/$userFile"
}

main(){
    for host in $(echo ${!U_H_dict[*]});do
        {
        userFile=$(echo ${U_H_dict[$host]})
        send
        remoteExec
        }&
    done
}

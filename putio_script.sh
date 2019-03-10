#!/bin/bash
date +%r

while :
do

if [ $MOVIES_FOLDER_ID != 0 ]
then
  node /put-io-sync/sync.js -d $MOVIES_FOLDER_ID -l /Movies >> /putio.log 
fi

if [ $TV_FOLDER_ID != 0 ]
then
  node /put-io-sync/sync.js -d $TV_FOLDER_ID -l /TV >> /putio.log
fi

sleep 60
done

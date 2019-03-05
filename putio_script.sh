if [ $MOVIES_FOLDER_ID != 0 ]
then
  node /put-io-sync/sync.js -d $MOVIES_FOLDER_ID -l /Movies &
fi

if [ $TV_FOLDER_ID != 0 ]
then
  node /put-io-sync/sync.js -d $TV_FOLDER_ID -l /TV &
fi

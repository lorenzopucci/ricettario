#!/bin/bash

[ -d backup ] || mkdir backup

while inotifywait -e modify /usr/local/lib/ricettario/database.json; do
    filename=$(date +"%d-%m-%Y_%T").json
    cp /usr/local/lib/ricettario/database.json backup/$filename
done
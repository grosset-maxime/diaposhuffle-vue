#!/bin/bash
BASEDIR=$(dirname "$0")

echo "Backup..."
rm -dR $BASEDIR/temp
mkdir $BASEDIR/temp
mv $BASEDIR/public/js $BASEDIR/temp
mv $BASEDIR/public/css $BASEDIR/temp
mv $BASEDIR/public/index.php $BASEDIR/temp

echo "Extract..."
7z x -y -o$BASEDIR/public /volume1/homes/maxou/dist.7z

echo "Clean up..."
rm /volume1/homes/maxou/dist.7z

echo "Done :D"

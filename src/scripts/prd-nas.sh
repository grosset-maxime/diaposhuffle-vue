#!/bin/bash
echo "Backup..."
rm -dR ./temp
mkdir ./temp
mv ./public/js ./temp
mv ./public/css ./temp
mv ./public/index.php ./temp

echo "Extract..."
7z x -y -o./public /volume1/homes/maxou/dist.7z

echo "Clean up..."
rm /volume1/homes/maxou/dist.7z

echo "Done :D"

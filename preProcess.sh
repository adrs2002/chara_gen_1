#!/bin/sh

# 出力フォルダの掃除
rimraf ./build
mkdir ./build

# contentsのコピー
mkdir ./build/content
cp -a ./src/content/** ./build/content

# 基本ファイルのコピー
# cp ./src/main.html ./build/

mkdir ./build/lib
cp ./lib/*.js ./build/lib
cat ./lib/threeLibs/*.js > ./build/lib/threelibs.js
cat ./lib/engine/*.js > ./build/lib/Engine.js

mkdir ./build/js
cp ./src/js/*.js ./build/js

mkdir ./build/css
cp -a ./src/css ./build

echo "######-- pre process complete --######"
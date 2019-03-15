#!/bin/bash

rollup -c rollup.config.js -i ./src/pages/_hanger.js -o ./build/pages/hanger.js -f es 
cp ./src/pages/hanger.html ./build/pages

rollup -c rollup.config.js -i ./src/pages/_mainScene.js -o ./build/pages/mainScene.js -f es 

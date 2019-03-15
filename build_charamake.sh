#!/bin/bash

rollup -c rollup.config.js -i ./src/pages/charaMake/_index.js -o ./build/pages/charaMake/index.js -f es

cp ./src/pages/charaMake/*.html ./build/pages/charaMake

cp ./src/pages/charaMake/index_ui.js ./build/pages/charaMake

cp ./src/charaMake.html ./build/
/**
 * 実際にゲームとして実装する際の、必要な処理を書き加える例がこちら
 */

import GameScene_base from './../lib/gameScene_base.js';

export default class GameScene extends GameScene_base {
    constructor() {
        super();
    }

    update(_delta) {
        super._update(_delta);
    }

    draw() {
        super._draw();
    }

    /* 操作からの受取イベント系 */
    onMouseMove(ev) {}

    onMouseUp(ev) {}

    onTap(ev) {}

    onPinch(ev) {}

    onSwipe(ev) {}
}

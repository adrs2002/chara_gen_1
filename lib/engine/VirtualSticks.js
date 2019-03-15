/**
 * virtual pads(sticks) class
 * @class VirtualSticks
 * @static
 */
// eslint-disable-next-line no-unused-vars
class VirtualSticks {
    constructor(_stickCount = 2, _debug = false) {
        this.stick = [];
        for (let i = 0; i < _stickCount; i++) {
            // eslint-disable-next-line no-undef
            this.stick.push(new vStick(_debug));
        }
    }

    set(ev) {
        for (let i = 0; i < Math.min(this.stick.length, ev.length); i++) {
            this.stick[i].set(ev[i]);
        }
    }

    /**
     * update virtual sticks from input.
     * @method update
     * @param {ev} pointers object from hammer
     * @example
     *      virtualSticks.update(ev);
     **/
    update(ev) {
        if (this.stick.length == 1) {
            this.stick[0].update(ev[0]);
        } else {
            for (let i = 0; i < ev.length; i++) {
                // ウィンドウの右半分/左半分で、仮想スティック入力を分ける
                if (ev[i].clientX < Engine.c2d.halfWidth) {
                    this.stick[0].update(ev[i]);
                } else {
                    this.stick[1].update(ev[i]);
                }
            }
        }
    }

    /**
     * set neutral input virtual sticks .
     * @method release
     * @example
     *      virtualSticks.release(ev);
     **/
    release(ev) {
        if (this.stick.length == 1) {
            this.stick[0].release();
        } else {
            for (let i = 0; i < ev.length; i++) {
                if (ev[i].clientX < Engine.c2d.halfWidth) {
                    this.stick[0].release();
                } else {
                    this.stick[1].release();
                }
            }
        }
    }

    /**
     * draw to canvas about virtual sticks input.
     * @method debugDraw
     * @example
     *      virtualSticks.debugDraw();
     **/
    debugDraw(_id) {
        for (let i = 0; i < this.stick.length; i++) {
            if (_id != undefined) {
                if (_id == i) {
                    this.stick[i].debugDraw();
                }
            } else {
                this.stick[i].debugDraw();
            }
        }
    }
}

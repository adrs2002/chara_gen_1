/**
 * virtual pad(stick) class
 * @class vStick
 **/
// eslint-disable-next-line no-unused-vars
class vStick {
    constructor(_debug) {
        this.initialPoint = new THREE.Vector2(0, 0);
        this.distance = 0;
        this.Velocity = new THREE.Vector2(0, 0);
        this.calcV = new THREE.Vector2(0, 0);
        this.ClientPos = new THREE.Vector2(0, 0);
        this.debug = _debug;
    }

    /*
     * set initial point for virtual stick.
     * @method set
     * @param {_pointer} pointer object from hammer
     * @example
     *      virtualSticks[0].set(ev);
     **/
    set(_pointer) {
        this.initialPoint.set(_pointer.clientX, _pointer.clientY);
    }

    /*
     * update virtual stick from input.
     * @method update
     * @param {_pointer} pointer object from hammer
     * @example
     *      virtualSticks[0].update(ev);
     **/
    update(_pointer) {
        this.ClientPos.set(_pointer.clientX, _pointer.clientY);
        if (this.initialPoint.x == 0 && this.initialPoint.y == 0) {
            this.set(_pointer);
            if (_pointer.movementX) {
                this.Velocity.set(_pointer.movementX, _pointer.movementY);
            } else {
                this.Velocity.set(0, 0);
            }
        } else {
            this.calcV.copy(this.ClientPos);
            this.calcV.sub(this.initialPoint);
            this.Velocity.copy(this.calcV);
        }
        this.distance = this.Velocity.length();
        if (this.distance > 0) {
            this.Velocity = this.Velocity.normalize();
        }
    }

    /*
     * set neutral input virtual sticks .
     * @method release
     * @example
     *      virtualSticks[0].release();
     **/
    release() {
        this.initialPoint.set(0, 0);
        this.distance = 0;
        this.Velocity.set(0, 0);
    }

    /**
     * draw to canvas about virtual sticks input.
     * @method debugDraw
     * @example
     *      virtualSticks[0].debugDraw();
     **/
    debugDraw() {
        if (this.distance == 0 || !Engine || !Engine.c2d) {
            return;
        }
        const pathObj = new ctxPathObject();
        pathObj.setCircle(this.initialPoint.x, this.initialPoint.y, 32);
        Engine.c2d.pathObjList.push(pathObj);

        const pathObj2 = new ctxPathObject();
        pathObj2.setCircle(this.initialPoint.x, this.initialPoint.y, 128);
        Engine.c2d.pathObjList.push(pathObj2);

        const pathObj3 = new ctxPathObject();
        pathObj3.setCircle(this.ClientPos.x, this.ClientPos.y, 32);
        Engine.c2d.pathObjList.push(pathObj3);
    }
}

/////////////
const ctxPathType = {
    rectangle: 0,
    circle: 1,
    pathes: 2,
};

class ctxPathObject {
    constructor() {
        this.fillStyleStr = '';
        this.strokeStyleStr = '';
        this.fillFlg = false;
        this.strokeFlg = false;
        this.positionData = [0, 0, 0, 0, 0];
        this.pathPositions = [];
        this.closeFlag = false;
        this.type = ctxPathType.rectangle;
    }

    setRectangle(_x, _y, _width, _height, _options = {}) {
        const {
            _fillStyleStr = 'rgb(255,255,255)',
            _strokeStyleStr = 'rgb(64,64,64)',
            _fillFlg = true,
            _strokeFlg = false,
            _positions = [],
        } = _options;
        this.type = ctxPathType.rectangle;

        this.fillStyleStr = _options._fillStyleStr;
        this.strokeStyleStr = _options._strokeStyleStr;
        this.fillFlg = _options._fillFlg;
        this.strokeFlg = _options._strokeFlg;
        this.positionData = [_x, _y, _width, _height, 0];
        this.pathPositions = [];
    }

    setCircle(_x, _y, _size, _options = {}) {
        const {
            _fillStyleStr = 'rgba(0,0,0, 0.3)',
            _strokeStyleStr = 'rgb(64,64,64)',
            _fillFlg = true,
            _strokeFlg = false,
            _positions = [],
            _start = 0,
            _end = Math.PI * 2,
            _closeFlag = true,
        } = _options;
        this.type = ctxPathType.circle;

        this.fillStyleStr = _fillStyleStr;
        this.strokeStyleStr = _strokeStyleStr;
        this.fillFlg = _fillFlg;
        this.strokeFlg = _strokeFlg;
        this.positionData = [_x, _y, _size, _start, _end];
        this.pathPositions = [];
        this.closeFlag = _closeFlag;
    }
}

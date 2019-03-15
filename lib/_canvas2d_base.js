/**
 * 大体どんなゲームでも使えそうだなとかの共通２D描画処理を書き連ねていく予定がこちら
 */
class canvas2d_base {
  constructor(_canvas) {
    this.tgtCanvas = _canvas;
    this.ctx = this.tgtCanvas.getContext('2d');
    this.baseFontStr = "bold 32px sans-serif ";
    this.subFontStr = "bold 20px sans-serif ";

    this.bigFontStr = "bolder 48px sans-serif ";

    this.efTotalHeight = 0;
    this.width = 320;
    this.height = 320;
    this.halfWidth = 320;
    this.halfHeight = 320;
    this.lastViewTime = 0;
    this.effectStringList = [];
    this.ctx.font = this.baseFontStr;
    this.StringList = [];
    this.pathObjList = [];
    this.init();
  }

  init() {
    this.resize();
    this.lastViewTime = 0;
    this.effectStringList = [];
    this.StringList = [];
    this.pathObjList = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  resize() {
    this.width = this.tgtCanvas.width;
    this.height = this.tgtCanvas.height;
    this.ctx.font = this.baseFontStr;

    this.halfWidth = this.width * 0.5 | 0;
    this.halfHeight = this.height * 0.5 | 0;
  };

  update(_delta) {
    this._update(_delta);
  }

  draw() {    
    "use strict";
    this._draw();

    for (let i = 0; i < this.StringList.length; i++) {
      this.ctx.font = this.StringList[i].fontSetStr;
      this.ctx.fillStyle = this.StringList[i].fillStyleStr;
      this.ctx.strokeStyle = this.StringList[i].strokeStyleStr;
      this.ctx.fillText(this.StringList[i].str, this.StringList[i].basePos[0], this.StringList[i].basePos[1]);
      this.ctx.strokeText(this.StringList[i].str, this.StringList[i].basePos[0], this.StringList[i].basePos[1]);
    }
    this.StringList = [];

    for (let i = 0; i < this.pathObjList.length; i++) {
      this.ctx.fillStyle = this.pathObjList[i].fillStyleStr;
      this.ctx.strokeStyle = this.pathObjList[i].strokeStyleStr;

      switch (this.pathObjList[i].type) {
        case ctxPathType.rectangle:
          if (this.pathObjList[i].fillFlg) {
            this.ctx.fillRect(this.pathObjList[i].positionData[0], this.pathObjList[i].positionData[1], this.pathObjList[i].positionData[2], this.pathObjList[i].positionData[3]);
          }
          if (this.pathObjList[i].strokeFlg) {
            this.ctx.strokeStyle(this.pathObjList[i].positionData[0], this.pathObjList[i].positionData[1], this.pathObjList[i].positionData[2], this.pathObjList[i].positionData[3]);
          }
          break;

        case ctxPathType.circle:
          this.ctx.beginPath();
          var startAngle = 0;
          var endAngle = 135 * Math.PI / 180;
          this.ctx.arc(this.pathObjList[i].positionData[0], this.pathObjList[i].positionData[1], this.pathObjList[i].positionData[2],
            this.pathObjList[i].positionData[3], this.pathObjList[i].positionData[4], false);
          if (this.pathObjList[i].closeFlag) {
            this.ctx.closePath();
          }
          if (this.pathObjList[i].fillFlg) {
            this.ctx.fill();
          }
          if (this.pathObjList[i].strokeFlg) {
            this.ctx.stroke();
          }
          break;

      }
    }

    this.pathObjList = [];
  };

  _update(_delta) {
    this.efTotalHeight = [];
    this.efTotalHeight[0] = 0;
    this.efTotalHeight[1] = 0;
    for (let i = this.effectStringList.length - 1; i >= 0; i--) {
      this.effectStringList[i].update(_delta);
      if (this.effectStringList[i].nowTime > this.effectStringList[i].lifeTime) {
        this.effectStringList.pop();
      } else {
        this.efTotalHeight[this.effectStringList[i].positionType] += this.effectStringList[i].lineHeight;
      }
    }
  };

  _draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.initFont();

  };

  initFont() {
    this.ctx.font = this.baseFontStr;
    this.ctx.fillStyle = 'rgb(0,255,0)';
    this.ctx.lineWidth = 0.75;
    this.ctx.strokeStyle = 'rgb(0,50,0)';
    this.ctx.lineWidth = 2;
  }

  fillStroke(_str, px, py) {
    this.ctx.fillText(_str, px, py, this.width - 20);
    this.ctx.strokeText(_str, px, py, this.width - 20);
  }

  drawBigString(_str) {

    this.ctx.font = this.bigFontStr;
    this.ctx.fillStyle = 'rgb(0,255,255)';
    this.ctx.strokeStyle = 'rgb(0,50,0)';
    this.ctx.lineWidth = 3;

    let BaseHeight = this.height * 0.5 - 36;
    let BaseWidth = this.width * 0.5;
    const metrics = this.ctx.measureText(_str);
    BaseWidth = BaseWidth - metrics.width * 0.5;

    this.ctx.fillText(_str, BaseWidth | 0, BaseHeight);
    this.ctx.strokeText(_str, BaseWidth | 0, BaseHeight);
  }

  /**
   * 指定したカメラから見た3Dの位置（Vector3)を、画面上の２D位置にする
   */
  getScreenPos(_vec3d, _cam) {
    var pos = new THREE.Vector3();
    pos.copy(_vec3d);
    pos.project(_cam);
    pos.x = (pos.x * this.width * 0.5) + this.width * 0.5;
    pos.y = -(pos.y * this.height * 0.5) + this.height * 0.5;

    return pos;
  };

  clearEffectStringList() {
    this.effectStringList = [];
  }

  addCanvasString(_str, _pos) {
    const canvasString = new canvasDrawString();
    canvasString.set(_str, {
      _basePos: _pos
    });
    this.StringList.push(canvasString);
  }

  addEffectString(_str) {
    const canvasString = new canvasDrawString().set(_str);
    this.effectStringList.push(canvasString);
  }
}

///////////

/**
 * canvasに描画する文字列をセットする
 * 
 */
class canvasDrawString {
  constructor() {
    this.str = '';
    this.fontSetStr = '';
    this.fillStyleStr = '';
    this.strokeStyleStr = '';
    this.lineHeight = 0;
    this.basePos = [0, 0];
  }

  set(_str, _options = {}) {
    const {
      _typeEffect = false,
        _fontSetStr = "bold 32px sans-serif",
        _lineHeight = 40,
        _fillStyleStr = 'rgb(255,255,255)',
        _strokeStyleStr = 'rgb(64,64,0)',
        _basePos = [0, 0]
    } = _options;

    this.str = _str;
    this.fontSetStr = _fontSetStr;
    this.lineHeight = _lineHeight;
    this.fillStyleStr = _fillStyleStr;
    this.strokeStyleStr = _strokeStyleStr;
    this.basePos = _basePos;
  };

}


///////////////////////////
var effectStringPositionType = {

  absolute: 0,
  Center: 1,
  centerTop: 2,
  centerBottom: 3,

  Left: 4,
  leftTop: 5,
  leftBottom: 6,

  Right: 7,
  rightTop: 8,
  rightBottom: 9,

};

////////////////////////////
class effectString extends canvasDrawString {
  constructor() {
    super();
    this.lifeTime = 0;
    this.beginTime = 0;
    this.nowTime = 0;
    this.level = 0;
    this.typeEffect = false;
    this.positionType = effectStringPositionType.Center;
  }

  set(_str, _lifeTime, _state, _options = {}) {
    const {
      _typeEffect = false,
        _fontSetStr = "bold 32px sans-serif",
        _lineHeight = 40,
        _fillStyleStr = 'rgb(255,255,255)',
        _strokeStyleStr = 'rgb(64,64,0)',
        _level = 0,
        _positionType = effectStringPositionType.absolute,
        _basePos = [0, 0]
    } = _options;

    this.str = _str;
    this.fontSetStr = _fontSetStr;
    this.lineHeight = _lineHeight;
    this.fillStyleStr = _fillStyleStr;
    this.strokeStyleStr = _strokeStyleStr;
    this.lifeTime = _lifeTime;
    this.typeEffect = _typeEffect;
    this.beginTime = _state.totalTime;
    this.nowTime = 0;
    this.level = _level;
    this.positionType = _positionType;
    this.basePos = _basePos;
  };

  update(_delta) {
    this.nowTime += _delta;
  };
}

/////////////
var ctxPathType = {
  rectangle: 0,
  circle: 1,
  pathes: 2
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
        _positions = []
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
        _closeFlag = true
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

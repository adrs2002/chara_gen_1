
/*****************************************************************************
 * game engine main initialize
 * 
 */

const Engine = {};

Engine.userDebugMode = false;
Engine.scene = null;
Engine.camera = null,
Engine.renderer = null,
Engine.clock = null;

Engine.LastDateTime = null;
Engine.lastTouchEnd = 0;

Engine.gameScene = null;
Engine.manager = null;
Engine.content = null;

Engine.virtualSticks = null;
Engine.stickCount = 1;

/**
 * Game Engine class
 * @class Engine
 * @main initialize
 * @static
 **/

Engine.initialize = function(init_callback, _stickCount = 1, _option = {}) {

  const {
    forceLanscape = false,
    forcePortrait = false,
    useBloom = false,
    pxRatioFactor = 1.0,
    useAntiAlias = false
  } = _option;

  Engine.stickCount = _stickCount;

  Engine.useAntiAlias = useAntiAlias;
  
  Engine.setViewerElement(_option.pxRatioFactor);

  Engine.forceLanscape = forceLanscape;
  Engine.forcePortrait = forcePortrait;
  Engine.useBloom = useBloom;

  Engine.reset3DScene();

  // タッチの検出は、上に乗っている2D用Canvasで検出することになる
  Engine.hammerInit();

  // 画面サイズ変更（端末回転時や上下から余計なバーがでてきた時）時に、描画領域を自動で変更する
  window.addEventListener('orientationchange', Engine.onWindowResize, false);
  window.addEventListener('resize', Engine.onWindowResize, false);
  Engine.onWindowResize({quick:true});

  // ピンチ操作（２本指でくぱぁする）で拡大縮小が出来てしまうのを防ぐ
  document.documentElement.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, false);
  // 画面がスクロールされるのを防ぐ
  document.documentElement.addEventListener('touchmove', function(event) {
    event.preventDefault();
  }, false);
  // ダブルタップで拡大されるのを防ぐ
  document.documentElement.addEventListener('touchend', function(event) {
    var now = (new Date()).getTime();
    if (now - Engine.lastTouchEnd <= 300) {
      event.preventDefault();
    }
    Engine.lastTouchEnd = now;
  }, false);

  // 仮想スティックのセット
  Engine.virtualSticks = new VirtualSticks(Engine.stickCount);

  function getDir(place, n) {
    　　return place.pathname.replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((n || 0) + 1) + "}$"), "/");
  };

  Engine.contentDir = window.location.origin + getDir(window.location,2) + "content/";

  init_callback();
}

Engine.load_managerProgress = function(item, loaded, total) {
  if (Engine.managerProgress) {
    Engine.managerProgress(item, loaded, total);
  }
}

Engine.load_onError = function(ex) {
  if (Engine.onError) {
    Engine.onError(ex);
  }
}


Engine.checkMoveGround = function(_ground, _object, _vector) {
    let moveLength = _vector.length();
    const hitRadius =  _object.boundingSphere? _object.boundingSphere.radius * _object.scale.z :  _object.geometry.boundingSphere.radius * _object.scale.z ;
    const tmpV = new THREE.Vector3();
    tmpV.copy(_vector);
    
    // まず、キャラの移動先に、「床」があるかどうかチェック
    tmpV.add(_object.position);
    
    // 高さの半分の半分くらいを、許容高さとしてみるが。
    if( _object.boundingBox){
      tmpV.y += _object.boundingBox.max.y * 1.5 * _object.scale.y;
    } else {
      if (_object.geometry.boundingBox){
        tmpV.y += _object.geometry.boundingBox.max.y * 1.5 * _object.scale.y;
      }
    }
    
    const ray1 = new THREE.Raycaster(tmpV, gameMath.HitAxisY);
    const hit1 = ray1.intersectObject(_ground);
    //　なければ、その時点でアウト
    if(hit1 == null || hit1.length == 0 ) { return { isHit:false, height:null, revisedVector: null } }
  
    // その後、その床までに、壁がないかどうかチェック
    const tmpV2 = new THREE.Vector3();
    tmpV2.copy(_vector);
    tmpV2.normalize();
    tmpV2.y = 0.5;  // ナナメ45度上に向かうベクトル
    tmpV2.normalize();
  
    const ray2 = new THREE.Raycaster(tmpV, tmpV2);
    const hit2 = ray2.intersectObject(_ground);
  
    if(hit2 != null && hit2.length > 0 ) {
        hit2.sort(function(a,b){
          return a.distance > b.distance;
      });
  
      // 距離を見て、移動ベクトル長より短い点があったら、壁に当たったとする。
      if(hit2[0].distance < moveLength){
        // 壁までの位置で、Vectorを補正する
        moveLength = hit2[0].distance;
      }
  
      if(hit2[0].distance < hitRadius){
        moveLength = 0;
      }
  
  
    }
  
    // 移動可能な高さの床があった、という判断。
    //　高さが複数あった場合は、一番高い点にする
    if(hit1.length > 1){
      hit1.sort(function(a,b){
        return a.point.y > b.point.y;
      });
    }
    
    return { isHit:true, height:hit1[0].point.y, revisedVector: tmpV2.multiplyScalar( moveLength ) };
  
  }

  

Engine.hammer = null;
Engine.hammerInit = function() {
    // 2dCanvas
    var hammer = new Hammer(Engine.el_Canvas, {
      inputClass: Hammer.TouchMouseInput
    });
  
    hammer.get('pan').set({
      direction: Hammer.DIRECTION_ALL,
      pointers: 0
    });
  
    hammer.get('press').set({
      time: 1,
    });
    hammer.get('tap');
  
    hammer.get('swipe').set({
      direction: Hammer.DIRECTION_ALL
    });
  
    if (Engine.stickCount == 1) {
      hammer.get('pinch').set({
        enable: true
      });
      hammer.on("pinch", function(ev) {
        if (Engine.gameScene.onPinch) Engine.gameScene.onPinch(ev);
      });
    }
  
    hammer.on("press", function(ev) {
      if (Engine.gameScene.onMouseDown) Engine.gameScene.onMouseDown(ev);
    });
    hammer.on("pressup", function(ev) {
      if (Engine.gameScene.onMouseUp) Engine.gameScene.onMouseUp(ev);
    });
  
    hammer.on("tap", function(ev) {
      if (Engine.gameScene.onTap) Engine.gameScene.onTap(ev);
    });
  
    hammer.on("panmove", function(ev) {
      Engine.virtualSticks.update(ev.pointers);
      if (Engine.gameScene.onMouseMove) Engine.gameScene.onMouseMove(ev);
    });
    hammer.on("panend", function(ev) {
      Engine.virtualSticks.release(ev.changedPointers);
      if (Engine.gameScene.onMouseUp) Engine.gameScene.onMouseUp(ev.changedPointers);
    });
  
    hammer.on("swipe", function(ev) {
      if (ev.deltaTime < 350 && Engine.gameScene.onSwipe) Engine.gameScene.onSwipe(ev);
    });
  
  }

  
/*****************/
class LezyCam {
    constructor(_lezyFrame = 10, _firstPos = new THREE.Vector3(), _firstLookat = new THREE.Vector3()) {
      this.positions = [];
      this.lookAtPositions = [];
      this.lezyFrame = _lezyFrame;
      for (let i = 0; i < _lezyFrame; i++) {
        this.positions.push([_firstPos.x, _firstPos.y, _firstPos.z]);
        this.lookAtPositions.push([_firstLookat.x, _firstLookat.y, _firstLookat.z]);
      }
      this.loop = _lezyFrame - 1;
      this.tmpPos = new THREE.Vector3();
      this.tmpPos2 = new THREE.Vector3();
    }
  
    update(_cam, _pos, _lookat) {
      this.tmpPos.set(0, 0, 0);
      this.tmpPos2.set(0, 0, 0);
      for (let i = 0; i < this.loop; i++) {
        this.positions[i][0] = this.positions[i + 1][0];
        this.positions[i][1] = this.positions[i + 1][1];
        this.positions[i][2] = this.positions[i + 1][2];
        this.tmpPos.x += this.positions[i][0];
        this.tmpPos.y += this.positions[i][1];
        this.tmpPos.z += this.positions[i][2];
  
        this.lookAtPositions[i][0] = this.lookAtPositions[i + 1][0];
        this.lookAtPositions[i][1] = this.lookAtPositions[i + 1][1];
        this.lookAtPositions[i][2] = this.lookAtPositions[i + 1][2];
        this.tmpPos2.x += this.lookAtPositions[i][0];
        this.tmpPos2.y += this.lookAtPositions[i][1];
        this.tmpPos2.z += this.lookAtPositions[i][2];
      }
      this.positions[this.loop][0] = _pos.x;
      this.positions[this.loop][1] = _pos.y;
      this.positions[this.loop][2] = _pos.z;
      this.tmpPos.x += _pos.x;
      this.tmpPos.y += _pos.y;
      this.tmpPos.z += _pos.z;
  
      this.lookAtPositions[this.loop][0] = _lookat.x;
      this.lookAtPositions[this.loop][1] = _lookat.y;
      this.lookAtPositions[this.loop][2] = _lookat.z;
      this.tmpPos2.x += _lookat.x;
      this.tmpPos2.y += _lookat.y;
      this.tmpPos2.z += _lookat.z;
  
      if (this.tmpPos.length() > 0) {
        this.tmpPos.x = this.tmpPos.x / this.lezyFrame;
        this.tmpPos.y = this.tmpPos.y / this.lezyFrame;
        this.tmpPos.z = this.tmpPos.z / this.lezyFrame;
      }
      if (this.tmpPos2.length() > 0) {
        this.tmpPos2.x = this.tmpPos2.x / this.lezyFrame;
        this.tmpPos2.y = this.tmpPos2.y / this.lezyFrame;
        this.tmpPos2.z = this.tmpPos2.z / this.lezyFrame;
      }
  
      _cam.position.copy(this.tmpPos);
      _cam.lookAt(this.tmpPos2);
    }
  
  };
  
  //ブルームエフェクトのパラメーター
Engine.BloomParams = {
    projection: 'normal',
    background: false,
    exposure: 1.0,
    bloomStrength: 0.4,
    bloomThreshold: 1.0,
    bloomRadius: 0.64
  };
  //ブルーム関連
  Engine.renderScene_back = null;
  Engine.renderScene = null;
  Engine.effectFXAA = null;
  Engine.bloomPass = null;
  Engine.BloomComposer = null;
  Engine.copyShader = null;
  
  Engine.useBloom = false;
  
  Engine.pathInit = function(){    
    Engine.renderer.antialias = false;
    Engine.renderScene_back = new THREE.RenderPass(Engine.scene_back, Engine.camera_back);
    Engine.renderScene = new THREE.RenderPass(Engine.scene, Engine.camera);
    Engine.renderScene.clear = false;
  }

  Engine.initBloom = function() {
    Engine.pathInit();
    //ブルームエフェクト  
    // threeComps.renderScene.clear = true;
    if(!Engine.effectFXAA) {Engine.initFXAA();}
    Engine.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(Engine.container.clientWidth, Engine.container.clientHeight), 1.5, 0.4, 0.85); //1.0, 9, 0.5, 512);
    Engine.BloomComposer = new THREE.EffectBloomComposer(Engine.renderer);
    Engine.BloomComposer.setSize(Engine.container.clientWidth, Engine.container.clientHeight);
  
    Engine.BloomComposer.addPass(Engine.renderScene_back);
    Engine.BloomComposer.addPass(Engine.renderScene);
  
    Engine.BloomComposer.addPass(Engine.effectFXAA);
    Engine.BloomComposer.addPass(Engine.bloomPass);
    Engine.BloomComposer.addPass(Engine.copyShader);
    //threeComps.renderer.toneMapping = THREE.ReinhardToneMapping;
    Engine.renderer.gammaInput = true;
    Engine.renderer.gammaOutput = true;
    Engine.renderer.toneMappingExposure = Math.pow(Engine.BloomParams.exposure, 4.0);
  
  }

  //FXAA anti
  Engine.FXAAComposer = null;
  Engine.initFXAA = function() {
    Engine.pathInit();
    const rendererSize = Engine.renderer.getDrawingBufferSize();
    
    Engine.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    Engine.effectFXAA.uniforms['resolution'].value.set(1 / rendererSize.width, 1 / rendererSize.height);
    //Engine.effectFXAA.uniforms['resolution'].value.set(1 / Engine.container.clientWidth, 1 / Engine.container.clientHeight);
    Engine.effectFXAA.renderToScreen = true;

    Engine.copyShader = new THREE.ShaderPass(THREE.CopyShader);
    Engine.copyShader.renderToScreen = true;

    Engine.FXAAComposer = new THREE.EffectComposer(Engine.renderer);
    Engine.FXAAComposer.setSize(rendererSize.width, rendererSize.height);  
    Engine.FXAAComposer.addPass(Engine.renderScene_back);
    Engine.FXAAComposer.addPass(Engine.renderScene);

    Engine.FXAAComposer.addPass(Engine.effectFXAA);
    //Engine.FXAAComposer.addPass(Engine.copyShader);
  }

Engine.reset3DScene = function(_deep) {

  if (_deep) {
    if (Engine.content) {
      Engine.content = {};
      delete Engine.content;
    }
    Engine.content = new Content();
  }

  if (Engine.scene) {
    delete Engine.scene;
  }
  Engine.scene = new THREE.Scene();

  if (Engine.camera) {
    delete Engine.camera;
  }
  Engine.camera = new THREE.PerspectiveCamera(45, Engine.container.clientWidth / Engine.container.clientHeight, 0.1, 5000);
  Engine.camera.position.set(0, 5, 10);
  Engine.camera.lookAt(new THREE.Vector3(0, 0, 0));
  Engine.camera.up.set(0, 1, 0);

  /*** */
  if (Engine.scene_back) {
    delete Engine.scene_back;
  }
  Engine.scene_back = new THREE.Scene();

  if (Engine.camera_back) {
    delete Engine.camera_back;
  }
  Engine.camera_back = new THREE.PerspectiveCamera(45, Engine.container.clientWidth / Engine.container.clientHeight, 10, 65000);
  Engine.camera_back.position.set(0, 5, 10);
  Engine.camera_back.lookAt(new THREE.Vector3(0, 0, 0));
  Engine.camera_back.up.set(0, 1, 0);
  /**** */

  if (Engine.manager) {
    delete Engine.manager;
  }
  Engine.manager = new THREE.LoadingManager();
  Engine.manager.onProgress = function(item, loaded, total) {
    Engine.load_managerProgress(item, loaded, total);
  };

  if (Engine.useBloom) {
    Engine.initBloom();
  }

  if (Engine.useFXAA) {
    Engine.initFXAA();
  }

}

Engine.update = function() {
  var nowTime = Date.now();
  var dulTime = nowTime - Engine.LastDateTime;
  Engine.LastDateTime = nowTime;

  window.requestAnimationFrame(Engine.update);

  if (Engine.gameScene) {
    Engine.gameScene.update(dulTime);
  }
  Engine.c2d.update(dulTime);
  Engine.draw();
}

Engine.draw = function() {
  Engine.camera_back.copy(Engine.camera);

  if (Engine.gameScene) {
    Engine.gameScene.draw();
  }

  if (Engine.useBloom) {
    Engine.renderer.clear(true, true, true);
    Engine.BloomComposer.render();
  } else if (Engine.useFXAA) {
    Engine.renderer.clear(true, true, true);
    Engine.FXAAComposer.render();    
  } else {
    Engine.renderer.clear(true, true, true);
    Engine.renderer.render(Engine.scene_back, Engine.camera_back);
    Engine.renderer.render(Engine.scene, Engine.camera);
  }

  Engine.c2d.draw();
}

Engine.addLight = function(_light) {
  Engine.scene.add(_light);
  Engine.scene_back.add(_light.clone());
}
Engine.container = null;
Engine.el_Canvas = null;
Engine.ctx2d = null;
Engine.c2d = null;
Engine.reSizeTimer = 0;

Engine.setViewerElement = function(_pxRatioFactor = 1.0){

  Engine.container = document.getElementById('viewdiv');
  Engine.renderer = new THREE.WebGLRenderer({
    alpha: true
  });
  Engine.renderer.autoClear = false;
  Engine.LastDateTime = Date.now();

  Engine.ViewerRatio =  window.devicePixelRatio * _pxRatioFactor;
  Engine.renderer.setPixelRatio(window.devicePixelRatio * _pxRatioFactor);
  Engine.renderer.setSize(Engine.container.clientWidth, Engine.container.clientHeight);
  Engine.renderer.setClearColor(0xffffff, 0);
  Engine.renderer.domElement.id = "c3d";
  Engine.renderer.domElement.style.zIndex = 50;
  Engine.renderer.antialias = Engine.useAntiAlias;

  Engine.renderer.toneMapping = THREE.Uncharted2ToneMapping;
  Engine.renderer.gammaInput = false;
  Engine.renderer.gammaOutput = true;
  Engine.renderer.toneMappingExposure = 1.5;
  Engine.renderer.toneMappingWhitePoint = 2.0;

  Engine.container.appendChild(Engine.renderer.domElement);
  

  // 画面と同じ大きさのCanvasを作成し、3D描画の真上に重ねる
  Engine.el_Canvas = document.createElement('canvas');
  Engine.el_Canvas.id = "c2d";
  Engine.el_Canvas.style.zIndex = 60;
  Engine.container.appendChild(Engine.el_Canvas);
  Engine.c2d = new canvas2d_base(Engine.el_Canvas);


}

Engine.onWindowResize = function(_option) {

  const {
    delay = 200,
      quick = false,
      width = Engine.container.clientWidth,
      height = Engine.container.clientHeight
  } = _option;

  if (Engine.reSizeTimer > 0) {
    clearTimeout(Engine.reSizeTimer);
  }

  function resizeFunc() {
    let targetW = width;
    let targetH = height;

    /*
        if (Engine.forceLanscape) {
          targetW = Math.max(Engine.container.clientWidth, Engine.container.clientHeight);
          targetH = Math.min(Engine.container.clientWidth, Engine.container.clientHeight);
        }
    
        if (Engine.forcePortrait) {
          targetW = Math.min(Engine.container.clientWidth, Engine.container.clientHeight);
          targetH = Math.max(Engine.container.clientWidth, Engine.container.clientHeight);
        }
        */
    Engine.camera.aspect = targetW / targetH;
    Engine.camera.updateProjectionMatrix();
    Engine.renderer.setSize(targetW, targetH);


    Engine.camera_back.copy(Engine.camera);
    Engine.el_Canvas.width = targetW;
    Engine.el_Canvas.height = targetH;

    Engine.width = targetW;
    Engine.height = targetH;

    if(Engine.effectFXAA){
      const rendererSize = Engine.renderer.getDrawingBufferSize();
      Engine.effectFXAA.uniforms['resolution'].value.set(1 / rendererSize.width, 1 / rendererSize.height);
      Engine.effectFXAA.uniformsNeedUpdate = true;   
      Engine.FXAAComposer.setSize(rendererSize.width, rendererSize.height);  
    }

    Engine.c2d.resize();

    if (Engine.afterResize) {
      Engine.afterResize();
    }

  }

  if (!quick) {
    Engine.reSizeTimer = setTimeout(resizeFunc, delay);
  } else {
    resizeFunc();
  }
}

Engine.setElementSize = function(_element, _option) {
  const {
    wpar = 1.0,
      hpar = 1.0
  } = _option;
  _element.style.width = Engine.width * wpar + "px";
  _element.style.height = Engine.height * hpar + "px";
}


Engine.viewModal = function(_flag, _options) {
  if (!_flag) {
    document.getElementById('modalWapper').style.display = 'none';
    return;
  }
  if (_options === undefined) {
    _options = {};
  }

  const {
    backColor = "rgba(6, 11, 7, 0.60)"
  } = _options;

  document.getElementById('modalWapper').style.backgroundColor = backColor;
  document.getElementById('modalWapper').style.display = 'block';
}/**
 * virtual pads(sticks) class
 * @class VirtualSticks
 * @static
 */
class VirtualSticks {
  constructor(_stickCount = 2, _debug = false) {
    this.stick = [];
    for (let i = 0; i < _stickCount; i++) {
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
          this.stick[1].release();;
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

};/**
 * virtual pad(stick) class
 * @class vStick
 **/
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

};/**
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

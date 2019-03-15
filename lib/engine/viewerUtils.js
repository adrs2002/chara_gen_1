Engine.container = null;
Engine.el_Canvas = null;
Engine.ctx2d = null;
Engine.c2d = null;
Engine.reSizeTimer = 0;

Engine.setViewerElement = function(_pxRatioFactor = 1.0) {
    Engine.container = document.getElementById('viewdiv');
    Engine.renderer = new THREE.WebGLRenderer({
        alpha: true,
    });
    Engine.renderer.autoClear = false;
    Engine.LastDateTime = Date.now();

    Engine.ViewerRatio = window.devicePixelRatio * _pxRatioFactor;
    Engine.renderer.setPixelRatio(window.devicePixelRatio * _pxRatioFactor);
    Engine.renderer.setSize(
        Engine.container.clientWidth,
        Engine.container.clientHeight
    );
    Engine.renderer.setClearColor(0xffffff, 0);
    Engine.renderer.domElement.id = 'c3d';
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
    Engine.el_Canvas.id = 'c2d';
    Engine.el_Canvas.style.zIndex = 60;
    Engine.container.appendChild(Engine.el_Canvas);
    // eslint-disable-next-line no-undef
    Engine.c2d = new canvas2d_base(Engine.el_Canvas);
};

Engine.onWindowResize = function(_option) {
    const {
        delay = 200,
        quick = false,
        width = Engine.container.clientWidth,
        height = Engine.container.clientHeight,
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

        if (Engine.effectFXAA) {
            const rendererSize = Engine.renderer.getDrawingBufferSize();
            Engine.effectFXAA.uniforms['resolution'].value.set(
                1 / rendererSize.width,
                1 / rendererSize.height
            );
            Engine.effectFXAA.uniformsNeedUpdate = true;
            Engine.FXAAComposer.setSize(
                rendererSize.width,
                rendererSize.height
            );
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
};

Engine.setElementSize = function(_element, _option) {
    const { wpar = 1.0, hpar = 1.0 } = _option;
    _element.style.width = Engine.width * wpar + 'px';
    _element.style.height = Engine.height * hpar + 'px';
};

Engine.viewModal = function(_flag, _options) {
    if (!_flag) {
        document.getElementById('modalWapper').style.display = 'none';
        return;
    }
    if (_options === undefined) {
        _options = {};
    }

    const { backColor = 'rgba(6, 11, 7, 0.60)' } = _options;

    document.getElementById('modalWapper').style.backgroundColor = backColor;
    document.getElementById('modalWapper').style.display = 'block';
};

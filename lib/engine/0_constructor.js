/*****************************************************************************
 * game engine main initialize
 *
 */

const Engine = {};

Engine.userDebugMode = false;
Engine.scene = null;
(Engine.camera = null), (Engine.renderer = null), (Engine.clock = null);

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
        useAntiAlias = false,
    } = _option;

    Engine.stickCount = _stickCount;

    Engine.useAntiAlias = useAntiAlias;

    Engine.setViewerElement(pxRatioFactor);

    Engine.forceLanscape = forceLanscape;
    Engine.forcePortrait = forcePortrait;
    Engine.useBloom = useBloom;

    Engine.reset3DScene();

    // タッチの検出は、上に乗っている2D用Canvasで検出することになる
    Engine.hammerInit();

    // 画面サイズ変更（端末回転時や上下から余計なバーがでてきた時）時に、描画領域を自動で変更する
    window.addEventListener('orientationchange', Engine.onWindowResize, false);
    window.addEventListener('resize', Engine.onWindowResize, false);
    Engine.onWindowResize({ quick: true });

    // ピンチ操作（２本指でくぱぁする）で拡大縮小が出来てしまうのを防ぐ
    document.documentElement.addEventListener(
        'touchstart',
        function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        },
        false
    );
    // 画面がスクロールされるのを防ぐ
    document.documentElement.addEventListener(
        'touchmove',
        function(event) {
            event.preventDefault();
        },
        false
    );
    // ダブルタップで拡大されるのを防ぐ
    document.documentElement.addEventListener(
        'touchend',
        function(event) {
            var now = new Date().getTime();
            if (now - Engine.lastTouchEnd <= 300) {
                event.preventDefault();
            }
            Engine.lastTouchEnd = now;
        },
        false
    );

    // 仮想スティックのセット
    // eslint-disable-next-line no-undef
    Engine.virtualSticks = new VirtualSticks(Engine.stickCount);

    function getDir(place, n) {
        return place.pathname.replace(
            new RegExp('(?:\\/+[^\\/]*){0,' + ((n || 0) + 1) + '}$'),
            '/'
        );
    }

    Engine.contentDir =
        window.location.origin + getDir(window.location, 2) + 'content/';

    init_callback();
};

Engine.load_managerProgress = function(item, loaded, total) {
    if (Engine.managerProgress) {
        Engine.managerProgress(item, loaded, total);
    }
};

Engine.load_onError = function(ex) {
    if (Engine.onError) {
        Engine.onError(ex);
    }
};

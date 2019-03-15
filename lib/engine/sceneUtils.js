Engine.reset3DScene = function(_deep) {
    if (_deep) {
        if (Engine.content) {
            Engine.content = {};
            delete Engine.content;
        }
        // eslint-disable-next-line no-undef
        Engine.content = new Content();
    }

    if (Engine.scene) {
        delete Engine.scene;
    }
    Engine.scene = new THREE.Scene();

    if (Engine.camera) {
        delete Engine.camera;
    }
    Engine.camera = new THREE.PerspectiveCamera(
        45,
        Engine.container.clientWidth / Engine.container.clientHeight,
        0.1,
        5000
    );
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
    Engine.camera_back = new THREE.PerspectiveCamera(
        45,
        Engine.container.clientWidth / Engine.container.clientHeight,
        10,
        65000
    );
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
};

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
};

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
};

Engine.addLight = function(_light) {
    Engine.scene.add(_light);
    Engine.scene_back.add(_light.clone());
};

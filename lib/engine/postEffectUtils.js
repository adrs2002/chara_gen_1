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

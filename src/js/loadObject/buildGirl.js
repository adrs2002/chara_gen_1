import {
    faceAsset,
    exFaceAsset,
    animeBaseAsset,
    animeAsset,
    selectableAsset,
} from '../gltfAsset/charaAsset';
import baseShaderdObject from './baseShaderdObject';

import faceObject from './faceObject';
import bodyObject from './bodyObject';
import hukuObject from './hukuObject';
import hairObject from './hairObject';
import animeObjectBase from './animeObjectBase';

import { charaSettings } from './editableSetting';

import * as THREE from './../../../node_modules/three/build/three.module';

export default class buildGirl extends THREE.Object3D {
    constructor() {
        super();
        this.EditSettings = new charaSettings();
        this.baseShaderdObject = new baseShaderdObject();

        this.col_BodyColor_Base = new THREE.Vector3(0.95, 0.8, 0.6); //固定・ノーマル肌
        this.col_BodyColor_Red = new THREE.Vector3(0.99, 0.85, 0.8); //ピンクっぽい肌
        this.visible = false;
    }

    load(_suf) {
        this.Suf = _suf;
        const animeBaseasset = new animeBaseAsset(_suf);

        //髪テクスチャ＆ＭＺＧテクスチャの読み込み
        this.hairMaterialBase = this.createMat_Hair_Base();
        this.hairMaterialEdge = this.createMat_Hair_Edge();
        this.OuterMaterialBase = this.createMat_Outer();
        this.InnerMaterialBase = this.createMat_Inner();

        const faceasset = new faceAsset(_suf);
        const exFaceasset = new exFaceAsset(_suf);

        const f_hairAsset = new selectableAsset(
            'hair_f_1' + this.Suf,
            'hair_f_1'
        );
        const b_hairAsset = new selectableAsset(
            'hair_b_3' + this.Suf,
            'hair_b_3'
        );

        const bodyAsset = new selectableAsset(
            'huku_A_body' + this.Suf,
            'Huku_A_body'
        );
        const hukuAsset = new selectableAsset('huku_A' + this.Suf, 'Huku_A');

        return new Promise(resolve => {
            animeBaseasset.load().then(() => {
                faceasset.load().then(() => {
                    exFaceasset.load().then(() => {
                        bodyAsset.load().then(() => {
                            hukuAsset.load().then(() => {
                                f_hairAsset.load().then(() => {
                                    b_hairAsset.load().then(() => {
                                        this.build({
                                            animeBaseasset: animeBaseasset,
                                            bodyAsset: bodyAsset,
                                            faceasset: faceasset,
                                            exFaceasset: exFaceasset,
                                            f_hairAsset: f_hairAsset,
                                            b_hairAsset: b_hairAsset,
                                            hukuAsset: hukuAsset,
                                        });

                                        return resolve();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    build(_loader) {
        this.animeBase = new animeObjectBase(_loader.animeBaseasset);

        this.face = new faceObject(
            this,
            _loader.faceasset,
            _loader.exFaceasset
        );
        // 顔モデルは差し替えできない、という前提。他のモデルでも、ボーン構造を使いまわす
        this.skeletonBase = this.face.faceObject.children[0];
        this.mixer = new THREE.AnimationMixer(this.skeletonBase);

        this.body = new bodyObject(this, _loader.bodyAsset);
        this.Huku = new hukuObject(this, _loader.hukuAsset);

        this.f_hair = new hairObject(this, _loader.f_hairAsset);

        this.b_hair = new hairObject(this, _loader.b_hairAsset);

        this.loadedAnimation = [];
        this.addAnimation(this.animeBase.animations, 'animeBase' + this.Suf);

        //0はface(元boneオブジェクト)のため、スキップ
        for (let i = 1; i < this.children.length; i++) {
            this.setSkeleton(this.children[i]);
        }

        //this.children.push(this.animeBase.dumyBones);
        this.changeVisible(false);
        Engine.scene.add(this);
        /*
        const skeletonHelper = new THREE.SkeletonHelper(this.animeBase.dumyBones);
        skeletonHelper.material.linewidth = 2;
        Engine.scene.add(skeletonHelper);
    */
        //this.priLoadAnime('stand2' + this.Suf, 'standPose2' );

        this.changeAnime('animeBase' + this.Suf, 'composeTest');
    }

    setSkeleton(_o) {
        if (!_o) {
            return;
        }

        if (_o.type.toLowerCase().indexOf('skinnedmesh') > -1) {
            delete _o.skeleton;
            //_o.skeleton = this.animeBase.dumyBones.children[0].skeleton;
            _o.skeleton = this.skeletonBase.skeleton;
        }

        for (let i = 0; i < _o.children.length; i++) {
            this.setSkeleton(_o.children[i]);
        }
    }

    init() {}

    changeVisible(_flg) {
        this.visible = _flg;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].visible = _flg;
        }
    }

    randomInit(_colflg /*, _outerflg, _faceflg*/) {
        if (_colflg === undefined || _colflg === true) {
            this.changeCol_hair(
                new THREE.Color(Math.random(), Math.random(), Math.random())
            );
            this.changeCol_Eye(
                new THREE.Color(Math.random(), Math.random(), Math.random())
            );
            for (let i = 0; i < 5; i++) {
                this.changeCol_Outer(
                    i,
                    new THREE.Color(Math.random(), Math.random(), Math.random())
                );
            }
        }
    }

    updateFrame(_delta) {
        if (this.mixer) {
            this.mixer.update(_delta);
        }
    }

    addAnimation(_anime, _animeName) {
        for (let i = 0; i < _anime.length; i++) {
            _anime[i].animeName = _animeName;
            this.loadedAnimation.push(this.mixer.clipAction(_anime[i]));
            break;
        }
    }

    priLoadAnime(_animeName, _url) {
        const gltfA = new animeAsset(_animeName + this.Suf, _url);
        return new Promise(resolve => {
            gltfA.load().then(() => {
                this.addAnimation(gltfA.animations, _animeName);
                return resolve();
            });
        });
    }

    changeAnime(_animeName, _url) {
        let animeFind = false;
        for (let i = 0; i < this.loadedAnimation.length; i++) {
            if (this.loadedAnimation[i]._clip.animeName == _animeName) {
                this.loadedAnimation[i].reset();
                if (this.lastAction) {
                    this.lastAction.crossFadeTo(this.loadedAnimation[i], 0.3);
                    this.lastAction.paused = true;
                }
                this.loadedAnimation[i].play();
                this.lastAction = this.loadedAnimation[i];
                animeFind = true;
            }
        }
        if (animeFind) {
            this.visible = true;
            return;
        }

        return new Promise(() => {
            this.priLoadAnime(_animeName, _url).then(() => {
                return this.changeAnime(_animeName, _url);
            });
        });
    }

    ////////////////////////////////

    //////
    createMat_Hair_Base() {
        const ColArray = [];
        ColArray.push(new THREE.Vector3(1.0, 1.0, 0.0));
        ColArray.push(new THREE.Vector3(1.0, 1.0, 1.0));

        const phongShader = THREE.ShaderLib['phong'];
        const uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

        //uniforms.diffuse.value = THREE.Vector3(0.7,0.7,0.7);
        //uniforms.shininess.value =object.children[i].children[m].material.shininess;
        //uniforms.emissive.value = tgt.material.emissive;

        uniforms.u_v3Col1 = {
            type: 'v3v',
            value: ColArray,
        };

        uniforms.expanValue = {
            type: 'f',
            value: 0.0,
        };

        const defines = {};
        defines['USE_MAP'] = '';

        let F_shaderStr =
            this.baseShaderdObject.getF_header() +
            this.baseShaderdObject.getF_useCol1Array_1() +
            this.baseShaderdObject.getF_useLightCrip_hair() +
            this.baseShaderdObject.getF_UseConvertHSV();

        F_shaderStr =
            F_shaderStr +
            `

        void main() {	
      
          #include <clipping_planes_fragment>	
      
          vec4 diffuseColor = vec4( vec3(0.7), opacity );
          ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
          vec3 totalEmissiveRadiance = emissive; 
      
          vec4 texelColor = texture2D( map, vUv );

      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder1() +
            `
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular ;	
  
        #include <envmap_fragment>
    
        vec3 col1 = getCol1(vUv.x);
    
        // HSL化したときに 1 or 0 だと彩度がセットできないため、わずかながらにずらす
        float colLen = length(col1);
        col1 = mix(col1, WHITE2, step(1.73, colLen));
        col1 = mix(BLACK2, col1, step(0.05, colLen));

        // anime col convert    
        //float lightLen = length(outgoingLight) * 0.6;
        float lightLen = (outgoingLight.r + outgoingLight.g + outgoingLight.b) * 0.333;
        
        //get HSL
        vec3 hsl = RGBtoHSL(col1); //全部HLS→HCVに変えるかどうかは検討
        float firstL =mix(smoothstep(0.0,0.5, hsl.z), min(hsl.z*2.0, 1.5), step(0.5,hsl.z));
        float h_xVect = sign(hsl.x - 0.5);
        //////////////////////////////////////
        //light clipping
        float LightValued_L = lightLen + firstL;  //mix(hsl.z, max(hsl.z - (0.5 - lightLen) * hsl.z * 2.0, 0.01), lightLen);
        LightValued_L =  min(mix(F_LowClip * 0.125, lightingClip(LightValued_L * lightLen), firstL ) ,1.0 );
        
        //float Texed_L =  mix(max(F_LowClip * 0.125, LightValued_L - (0.5 - texelColor.x) * 1.5), LightValued_L, LightValued_L);
        float Texed_L = mix(mix(texelColor.x, LightValued_L, LightValued_L),
                            mix( texelColor.x ,LightValued_L,(LightValued_L - 0.5) * 2.0),
                            smoothstep(0.0, 0.5, abs(LightValued_L - 0.5)));
        
                            //Texed_L = texelColor.x;
        float hsRotateByTex = mix(hsl.x + (1.0 - texelColor.x) * abs(sin(hsl.x * 3.14)) * 0.5 * h_xVect * max(sin(hsl.x * 9.42),0.0), hsl.x, min(sin(Texed_L * 1.57), 1.0) );
        
        hsl.z = mix(LightValued_L, Texed_L * firstL, 1.0 - abs(hsRotateByTex - hsl.x) * 3.0);
        //change H from L
        hsl.x =  hsRotateByTex;
        
        //hsl.y = hsl.y * mix(cos(hsl.y) * (1.0 + (1.0 - hsl.z)),  hsl.y, hsl.y); 
        //to RGB
        gl_FragColor = vec4(HSLtoRGB(hsl) * directLight.color, 1.0 ) ;
        gl_FragColor = vec4(gl_FragColor.xyz + ambientLightColor, 1.0 ) ;
        //gl_FragColor = vec4(vec3(hsl.z),1.0);
        
      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder2() +
            `}`;

        const material = new THREE.ShaderMaterial({
            skinning: true,
            //morphTargets: true,
            uniforms: uniforms,
            defines: defines,
            vertexShader: phongShader.vertexShader,
            fragmentShader: F_shaderStr,
            lights: true,
            depthTest: true,
            transparent: false,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            fog: true,
        });

        const texLoader = new THREE.TextureLoader();
        texLoader.load(Engine.contentDir + 'model/hair_e.png', texture => {
            material.uniforms.map = {
                type: 't',
                value: texture,
            };
            material.needsUpdate = true;
        });

        return material;
    }

    createMat_Hair_Edge() {
        const ColArray = [];
        ColArray.push(new THREE.Vector3(1.0, 1.0, 0.0));
        ColArray.push(new THREE.Vector3(1.0, 1.0, 1.0));

        const phongShader = THREE.ShaderLib['phong'];
        const uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

        uniforms.u_v3Col1 = {
            type: 'v3v',
            value: ColArray,
        };

        uniforms.expanValue = {
            type: 'f',
            value: 0.0,
        };

        const defines = {};
        defines['USE_MAP'] = '';

        const F_shaderStr =
            this.baseShaderdObject.getF_header() +
            this.baseShaderdObject.getF_useCol1Array_1() +
            this.baseShaderdObject.getF_useLightCrip_hair() +
            this.baseShaderdObject.getF_UseConvertHSV() +
            `

        void main() {	
      
          #include <clipping_planes_fragment>	
      
          vec4 diffuseColor = vec4( diffuse, opacity );
          ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
          vec3 totalEmissiveRadiance = emissive; 
      
          vec4 texelColor = texture2D( map, vUv );

      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder1() +
            `
      vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular ;	

      #include <envmap_fragment>
  
      vec3 col1 = getCol1(vUv.x);
  
      // HSL化したときに 1 or 0 だと彩度がセットできないため、わずかながらにずらす
      float colLen = length(col1);
      col1 = mix(col1, WHITE2, step(1.73, colLen));
      col1 = mix(BLACK2, col1, step(0.1, colLen));
  
      // anime col convert    
      float lightLen = length(outgoingLight) * 0.1; //輪郭線のため、成分を下げる
              
      //get HSL
      vec3 hsl = RGBtoHCV(col1); //全部HLS→HCVに変えるかどうかは検討
      float firstL = hsl.z;
      float h_xVect = sign(hsl.x - 0.5);
      //////////////////////////////////////
      //light clipping
      float LightValued_L = mix(hsl.z, max(hsl.z - (0.5 - lightLen) * hsl.z * 1.4, 0.01), lightLen);
      LightValued_L =  mix(F_LowClip * 0.125, lightingClip(LightValued_L * lightLen), firstL );
      
      //float Texed_L =  mix(max(F_LowClip * 0.125, LightValued_L - (0.5 - texelColor.x) * 1.1), LightValued_L, LightValued_L);

      float hsRotateByTex = mix(hsl.x + (1.0 - texelColor.x) * abs(sin(hsl.x * 3.14)) * 0.3 * h_xVect * max(sin(hsl.x * 9.42),0.0), hsl.x, min(sin(lightLen * 1.57), 1.0) );
      
      hsl.z = firstL * 0.25;
      //change H from L
      hsl.x =  hsRotateByTex;
      //to RGB
      gl_FragColor = vec4(HSLtoRGB(hsl) * directLight.color, 1.0 ) ;
      gl_FragColor = vec4(gl_FragColor.xyz + ambientLightColor, 1.0 ) ;
      //gl_FragColor = vec4(vec3(hsl.z ),1.0);
 
      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder2() +
            `}`;

        const material = new THREE.ShaderMaterial({
            skinning: true,
            //morphTargets: true,
            uniforms: uniforms,
            defines: defines,
            vertexShader: phongShader.vertexShader,
            fragmentShader: F_shaderStr,
            lights: true,
            depthTest: true,
            transparent: false,
            blending: THREE.NormalBlending,
            //side : THREE.DoubleSide,
            fog: true,
        });

        const texLoader = new THREE.TextureLoader();
        texLoader.load(Engine.contentDir + 'model/hair_e.png', texture => {
            material.uniforms.map = {
                type: 't',
                value: texture,
            };
            material.needsUpdate = true;
        });
        return material;
    }

    createMat_Outer() {
        const ColArray = [];
        ColArray.push(new THREE.Vector3().copy(this.col_BodyColor_Base)); //固定・ノーマル肌

        for (let i = 0; i < 10 - 1; i++) {
            const col = new THREE.Vector3(
                Math.random(),
                Math.random(),
                Math.random()
            );
            if (col.length() > 1.6 || col.length() < 0.4) {
                col.normalize();
            }
            ColArray.push(col);
        }

        const phongShader = THREE.ShaderLib['phong'];
        const uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

        //uniforms.diffuse.value = tgt.material.color;
        //uniforms.shininess.value =object.children[i].children[m].material.shininess;
        //uniforms.emissive.value = tgt.material.emissive;
        // uniforms.specular.value = object.children[i].children[m].material.specular;
        //uniforms.map = {type:"t", value:texture};

        uniforms.u_v3Col1 = {
            type: 'v3v',
            value: ColArray,
        };

        const ExpanArray = [];
        for (let i = 0; i < 10; i++) {
            ExpanArray.push(new THREE.Vector3(1.0));
        }

        uniforms.u_v3Expan = {
            type: 'v3v',
            value: ExpanArray,
        };

        uniforms.expanValue = {
            type: 'f',
            value: 0.0,
        };

        const defines = {};
        defines['USE_MAP'] = '';

        const F_shaderStr =
            this.baseShaderdObject.getF_header() +
            this.baseShaderdObject.getF_useCol1Array(10) +
            this.baseShaderdObject.getF_useLightCrip() +
            this.baseShaderdObject.getF_UseConvertHSV() +
            `

        void main() {	
      
          #include <clipping_planes_fragment>	
      
          vec4 diffuseColor = vec4( diffuse, opacity );
          ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
          vec3 totalEmissiveRadiance = emissive; 
      
          vec4 texelColor = texture2D( map, vUv );

      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder1() +
            this.baseShaderdObject.getF_inMethod_MainColorDetect() +
            this.baseShaderdObject.getF_inMethod_THREEIncluder2() +
            `}`;

        const material = new THREE.ShaderMaterial({
            skinning: true,
            morphTargets: true,
            uniforms: uniforms,
            defines: defines,
            vertexShader: this.baseShaderdObject.getEdgeVShader(),
            fragmentShader: F_shaderStr,
            lights: true,
            depthTest: true,
            transparent: false,
            blending: THREE.NormalBlending,
            //side : THREE.DoubleSide,
            fog: true,
        });

        return material;
    }

    createMat_Inner() {
        const ColArray = [];
        ColArray.push(new THREE.Vector3().copy(this.col_BodyColor_Base)); //固定・ノーマル肌
        ColArray.push(new THREE.Vector3(0.99, 0.99, 0.99)); //ひとまず白固定中

        for (let i = 0; i < 10 - 2; i++) {
            const col = new THREE.Vector3(
                Math.random(),
                Math.random(),
                Math.random()
            );
            if (col.length() > 1.6 || col.length() < 0.4) {
                col.normalize();
            }
            ColArray.push(col);
        }

        const phongShader = THREE.ShaderLib['phong'];
        const uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

        uniforms.u_v3Col1 = {
            type: 'v3v',
            value: ColArray,
        };

        const ExpanArray = [];
        for (let i = 0; i < 10; i++) {
            ExpanArray.push(new THREE.Vector3(1.0));
        }

        uniforms.u_v3Expan = {
            type: 'v3v',
            value: ExpanArray,
        };

        uniforms.expanValue = {
            type: 'f',
            value: 0.0,
        };

        const defines = {};
        defines['USE_MAP'] = '';

        const F_shaderStr =
            this.baseShaderdObject.getF_header() +
            this.baseShaderdObject.getF_useCol1Array(10) +
            this.baseShaderdObject.getF_useCol2() +
            this.baseShaderdObject.getF_useLightCrip() +
            this.baseShaderdObject.getF_UseConvertHSV() +
            `

        void main() {	
      
          #include <clipping_planes_fragment>	
      
          vec4 diffuseColor = vec4( diffuse, opacity );
          ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
          vec3 totalEmissiveRadiance = emissive; 
      
          vec4 texelColor = texture2D( map, vec2(vUv.x, 1.0 - vUv.y) );

      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder1() +
            `
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular ;	

        #include <envmap_fragment>

        vec3 col1 = mix(getCol1(vUv.x), getCol2(texelColor), step(0.1, vUv.x));

        // HSL化したときに 1 or 0 だと彩度がセットできないため、わずかながらにずらす
        float colLen = length(col1);
        col1 = mix(col1, WHITE2, step(1.73, colLen));
        col1 = mix(BLACK2, col1, step(0.1, colLen));

        // anime col convert    
        //float lightLen = length(outgoingLight) * 0.6;
        float lightLen = (outgoingLight.r + outgoingLight.g + outgoingLight.b) * 0.333;

        //get HSL
        vec3 hsl = RGBtoHSL(col1);
        float firstL = hsl.z;
        float h_xVect = sign(hsl.x - 0.5);

        //////////////////////////////////////
        //light clipping
        hsl.z =  mix(hsl.z, hsl.z - (0.5 - lightLen) * hsl.z * 0.6, 1.0);
        hsl.z =  lightingClip(hsl.z  * mix(0.2,1.0, step(expanValue, 0.00001)));
        //hsl.z =  mix(hsl.z * (1.0 - vUv.y), hsl.z, (1.0 - vUv.y));
        
        //change H from L
        hsl.x =  mix(hsl.x + firstL * abs(sin(hsl.x * 3.14))  * 0.3 * h_xVect  * max(sin(hsl.x * 9.42),0.0), hsl.x, min(sin(lightLen * 1.57), 1.0) );
        
        //to RGB
        gl_FragColor = vec4(HSLtoRGB(hsl) * directLight.color, 1.0 ) ;
        gl_FragColor = vec4(gl_FragColor.xyz + ambientLightColor, 1.0 ) ;

      ` +
            this.baseShaderdObject.getF_inMethod_THREEIncluder2() +
            `}`;

        const material = new THREE.ShaderMaterial({
            skinning: true,
            morphTargets: true,
            uniforms: uniforms,
            defines: defines,
            vertexShader: this.baseShaderdObject.getEdgeVShader(),
            fragmentShader: F_shaderStr,
            lights: true,
            depthTest: true,
            transparent: false,
            blending: THREE.NormalBlending,
            //side : THREE.DoubleSide,
            fog: true,
        });

        this.changeTex_Inner('inner_tex0');
        return material;
    }

    //////////////////////////////////////

    changeCol_hair(_vec) {
        this.EditSettings.hc = _vec;
        //this.f_hair.changeCol_hair(_vec);
        //this.b_hair.changeCol_hair(_vec);
        this.hairMaterialBase.uniforms.u_v3Col1.value[0].set(
            _vec.r,
            _vec.g,
            _vec.b
        );
        this.hairMaterialBase.uniforms.u_v3Col1.value.needsUpdate = true;

        this.hairMaterialEdge.uniforms.u_v3Col1.value[0].set(
            _vec.r,
            _vec.g,
            _vec.b
        );
        this.hairMaterialEdge.uniforms.u_v3Col1.value.needsUpdate = true;

        this.face.changeCol_hair(_vec);
    }

    changeCol_Eye(_vec) {
        this.EditSettings.ec = _vec;
        this.face.changeCol_Eye(_vec);
    }

    chagneObject_Hair_F(_assetVal, _col) {
        let assetName = '';
        if (isNaN(_assetVal)) {
            assetName = _assetVal;
        } else {
            assetName =
                Engine.gameScene.editableSetting.editableItems.hair_f[
                    _assetVal
                ];
        }

        if (
            this.f_hair &&
            assetName + this.Suf == this.f_hair.nowAssetName &&
            !this.loading_Hair_F
        ) {
            return;
        }

        const f_hairAsset = new selectableAsset(
            assetName + this.Suf,
            assetName
        );
        this.loading_Hair_F = assetName + this.Suf;

        this.EditSettings.hf = _assetVal;
        if (_col) {
            this.EditSettings.hc = _col;
        }

        return new Promise(resolve => {
            f_hairAsset.load().then(() => {
                if (this.loading_Hair_F == assetName + this.Suf) {
                    this.f_hair.remove();
                    delete this.loading_Hair_F;
                    delete this.f_hair;

                    this.f_hair = new hairObject(
                        this,
                        f_hairAsset,
                        this.EditSettings.hc
                    );
                    this.setSkeleton(this.f_hair.mainMesh);
                    this.setSkeleton(this.f_hair.exMesh);
                    return resolve();
                } else {
                    return resolve();
                }
            });
        });
    }

    chagneObject_Hair_B(_assetVal, _col) {
        let assetName = '';
        if (isNaN(_assetVal)) {
            assetName = _assetVal;
        } else {
            assetName =
                Engine.gameScene.editableSetting.editableItems.hair_b[
                    _assetVal
                ];
        }

        if (
            this.b_hair &&
            assetName + this.Suf == this.b_hair.nowAssetName &&
            !this.loading_Hair_B
        ) {
            return;
        }

        const b_hairAsset = new selectableAsset(
            assetName + this.Suf,
            assetName
        );
        this.loading_Hair_B = assetName + this.Suf;

        this.EditSettings.hb = _assetVal;
        if (_col) {
            this.EditSettings.hc = _col;
        }

        return new Promise(resolve => {
            b_hairAsset.load().then(() => {
                if (this.loading_Hair_B == assetName + this.Suf) {
                    this.b_hair.remove();
                    delete this.loading_Hair_B;
                    delete this.b_hair;

                    this.b_hair = new hairObject(
                        this,
                        b_hairAsset,
                        this.EditSettings.hc
                    );
                    this.setSkeleton(this.b_hair.mainMesh);
                    this.setSkeleton(this.b_hair.exMesh);
                    return resolve();
                } else {
                    return resolve();
                }
            });
        });
    }

    changeVal_Eye_Turi(_val) {
        this.EditSettings.eh = _val;
        this.face.changeVal_Turime(_val * (1.0 - this.EditSettings.ev));
    }

    changeVal_Eye_Bold(_val) {
        this.EditSettings.eb = _val;
        this.face.changeVal_Eye_Bold(_val);
    }

    changeVal_Eye_Type(_type, _val) {
        this.EditSettings.et = _type;
        this.EditSettings.ev = _val;
        this.face.changeVal_ExEye('', 0.0);
        this.face.changeVal_Eye_Type(_type, _val);
        if (!_type || _type.length === 0) {
            this.EditSettings.ev = 0;
        }

        this.face.changeVal_Turime(
            this.EditSettings.eh * (1.0 - this.EditSettings.ev)
        );
    }

    changeVal_Blow_Type(_type, _val) {
        this.EditSettings.bt = _type;
        this.EditSettings.bv = _val;
        this.face.changeVal_Blow_Type(_type, _val);
    }

    changeVal_ExEye(_type) {
        this.EditSettings.ex = _type;
        this.face.changeVal_Eye_Type('', 0);
        this.face.changeVal_Turime(0);
        this.face.changeVal_ExEye(_type, 1.0);
    }

    changeVal_Mouth_Type(_type, _val) {
        this.EditSettings.mt = _type;
        this.EditSettings.mv = _val;
        this.face.changeVal_Mouth_Type(_type, _val);
    }

    changeVal_ceek_red(_val) {
        this.EditSettings.rr = _val;
        this.face.changeVal_face_cheek(_val);
    }

    changeVal_face_gaan(_val) {
        this.EditSettings.gb = _val;
        this.face.changeVal_face_gaan(_val);
    }

    changeVal_body_col(_val) {
        const tgtCol_A = new THREE.Vector3().copy(this.col_BodyColor_Base);
        tgtCol_A.lerp(this.col_BodyColor_Red, _val);

        this.face.changeVal_body_color(tgtCol_A);

        this.OuterMaterialBase.uniforms.u_v3Col1.value[0].copy(tgtCol_A);
        this.OuterMaterialBase.uniforms.u_v3Col1.value.needsUpdate = true;

        this.InnerMaterialBase.uniforms.u_v3Col1.value[0].copy(tgtCol_A);
        this.InnerMaterialBase.uniforms.u_v3Col1.value.needsUpdate = true;
    }

    changeCol_Outer(_id, _vec) {
        /*
    switch(_id){
      case 1:this.EditSettings.wc1 = _vec;break;
      case 2:this.EditSettings.wc2 = _vec;break;
      case 3:this.EditSettings.wc3 = _vec;break;
      case 4:this.EditSettings.wc4 = _vec;break;
      case 5:this.EditSettings.wc5 = _vec;break;
    }  
    */
        this.EditSettings['wc' + _id] = _vec;
        this.OuterMaterialBase.uniforms.u_v3Col1.value[_id].set(
            _vec.r,
            _vec.g,
            _vec.b
        );
    }

    changeCol_Inner(_id, _vec) {
        this.EditSettings['pt' + _id] = _vec;
        this.InnerMaterialBase.uniforms.u_v3Col1.value[_id].set(
            _vec.r,
            _vec.g,
            _vec.b
        );
    }

    changeTex_Inner(_assetVal) {
        let assetName = '';
        if (isNaN(_assetVal)) {
            assetName = _assetVal;
        } else {
            assetName =
                Engine.gameScene.editableSetting.editableItems.mzgTex[
                    _assetVal - 0
                ];
        }

        if (assetName == this.mzgTexAssetName && !this.loading_MzgTex) {
            return;
        }

        const texLoader = new THREE.TextureLoader();
        texLoader.load(
            Engine.contentDir + 'model/' + assetName + '.png',
            texture => {
                if (this.loading_MzgTex === assetName) {
                    this.InnerMaterialBase.uniforms.map = {
                        type: 't',
                        value: texture,
                    };
                    this.InnerMaterialBase.needsUpdate = true;
                    this.mzgTexAssetName = assetName;
                }
            }
        );
        this.loading_MzgTex = assetName;
    }

    changeVal_bastSize(_val) {
        let setVal = _val - 0;

        const setTarget =
            setVal < 0
                ? Engine.gameScene.editableSetting.editableItems.bastSize[0]
                : Engine.gameScene.editableSetting.editableItems.bastSize[1];
        this.body.changeVal_bastSize(Math.abs(setVal), setTarget);
        this.Huku.changeVal_bastSize(Math.abs(setVal), setTarget);

        this.EditSettings.bst = setVal;
    }

    changeType_hand(_type, _val) {
        let setVal = '';
        if (isNaN(_val)) {
            setVal = _val;
        } else {
            if (_type.indexOf('a') > -1) {
                setVal =
                    Engine.gameScene.editableSetting.editableItems
                        .handMopth_all[_val - 0];
            } else {
                setVal =
                    Engine.gameScene.editableSetting.editableItems.handMopth_0[
                        _val - 0
                    ];
            }
        }

        const suffix = _type.substr(0, 1).toUpperCase();

        this.body.changeVal_Hand(1.0, suffix, setVal);

        setVal += '.' + suffix;
        this.EditSettings[_type] = setVal;
    }

    changeVal_Hand(_type, _val) {
        const suffix = _type.substr(0, 1).toUpperCase();
        this.body.changeVal_Hand(_val, suffix, this.EditSettings[_type]);
    }

    changeType_Outer(_type, _val) {
        let setVal = '';
        if (isNaN(_type)) {
            setVal = _type;
        } else {
            setVal =
                Engine.gameScene.editableSetting.editableItems.outerMopth[
                    _val - 0
                ];
        }

        this.Huku.changeVal_Outer(1.0, setVal);

        this.EditSettings['wmt'] = setVal;
    }

    changeVal_Outer(_val) {
        this.Huku.changeVal_Outer(_val, this.EditSettings['wmt']);
    }

    ///////////////

    changeEdiSetting(_type, _val) {
        if (_type === 'hf') {
            this.chagneObject_Hair_F(_val);
            return;
        }

        if (_type === 'hb') {
            this.chagneObject_Hair_B(_val);
            return;
        }

        if (_type === 'hc') {
            this.changeCol_hair(_val);
            return;
        }
        //////////
        if (_type === 'eh') {
            this.changeVal_Eye_Turi(_val);
            return;
        }

        if (_type === 'eb') {
            this.changeVal_Eye_Bold(_val);
            return;
        }

        if (_type === 'ec') {
            this.changeCol_Eye(_val);
            return;
        }

        if (_type === 'et') {
            let val = _val;
            if (val - 0 === 0) {
                val = '';
            }
            this.changeVal_Eye_Type(val, 1.0);
            return;
        }

        if (_type === 'ev') {
            this.changeVal_Eye_Type(this.EditSettings.et, _val - 0);
            return;
        }

        if (_type === 'bt') {
            this.changeVal_Blow_Type(_val, 1.0);
            return;
        }

        if (_type === 'bv') {
            this.changeVal_Blow_Type(this.EditSettings.bt, _val - 0);
        }

        if (_type === 'ex') {
            this.changeVal_ExEye(_val);
        }

        if (_type === 'mt') {
            this.changeVal_Mouth_Type(_val, 1.0);
            return;
        }

        if (_type === 'mv') {
            this.changeVal_Mouth_Type(this.EditSettings.mt, _val - 0);
            return;
        }

        if (_type === 'rr') {
            this.changeVal_ceek_red(_val - 0);
            return;
        }

        if (_type === 'gn') {
            this.changeVal_face_gaan(_val - 0);
            return;
        }

        if (_type === 'bc') {
            this.changeVal_body_col(_val - 0);
            return;
        }

        if (_type === 'bst') {
            this.changeVal_bastSize(_val - 0);
            return;
        }

        if (_type === 'ltt') {
            this.changeType_hand(_type, _val);
            return;
        }
        if (_type === 'lat') {
            this.changeType_hand(_type, _val);
            return;
        }
        if (_type === 'rtt') {
            this.changeType_hand(_type, _val);
            return;
        }
        if (_type === 'rat') {
            this.changeType_hand(_type, _val);
            return;
        }

        if (_type === 'ltv') {
            this.changeVal_Hand('ltt', _val);
            return;
        }
        if (_type === 'lav') {
            this.changeVal_Hand('lat', _val);
            return;
        }
        if (_type === 'rtv') {
            this.changeVal_Hand('rtt', _val);
            return;
        }
        if (_type === 'rav') {
            this.changeVal_Hand('rat', _val);
            return;
        }

        if (_type.indexOf('wc') > -1) {
            this.changeCol_Outer(_type.substr(2, 1) - 0, _val);
            return;
        }

        if (_type.indexOf('wmt') > -1) {
            this.changeType_Outer(_val);
            return;
        }

        if (_type.indexOf('wmv') > -1) {
            this.changeVal_Outer(_val);
            return;
        }

        if (_type.indexOf('pc') > -1) {
            this.changeCol_Inner(_type.substr(2, 1) - 0, _val);
            return;
        }

        if (_type.indexOf('pt') > -1) {
            this.changeTex_Inner(_val);
            return;
        }
    }
}

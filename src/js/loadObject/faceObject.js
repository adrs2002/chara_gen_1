import baseShaderdObject from './baseShaderdObject';

export default class faceObject extends baseShaderdObject {
    constructor(_parent, _faceAsset, _exFaceAsset) {
        super(_parent);
        this.faceObject = _faceAsset.getMeshbyName('chara1');
        this.faceMesh = _faceAsset.getMeshbyName('face_normal_0');
        this.exMesh = _exFaceAsset.getMeshbyMatName('mat_face_ex');

        this.faceMesh.position.set(0, 0, 0);
        this.exMesh.position.set(0, 0, 0);

        //this.faceMesh.scale.set(10,10,10);

        //this.initMopthKeys();
        this.mopthArray = [this.faceMesh, this.exMesh];
        super.initMopthDictionaryArray();

        this.ColArray = [];
        this.ExpanArray = [];
        this.ColArray.push(new THREE.Vector3(1.0, 1.0, 1.0)); //固定・白&黒
        this.ExpanArray.push(new THREE.Vector3()); //固定・白&黒
        this.ColArray.push(
            new THREE.Vector3().copy(this.parent.col_BodyColor_Base)
        ); //肌
        this.ExpanArray.push(new THREE.Vector3(0.8)); //肌

        for (let i = 2; i < 8 - 2; i++) {
            const col = new THREE.Vector3(
                Math.random(),
                Math.random(),
                Math.random()
            );
            if (col.length() > 1.6 || col.length() < 0.4) {
                col.normalize();
            }
            this.ColArray.push(col);
            this.ExpanArray.push(new THREE.Vector3());
        }

        //口の中
        this.ColArray.push(new THREE.Vector3(0.9, 0.15, 0.01));
        this.ExpanArray.push(new THREE.Vector3(0.4));
        //白目
        this.ColArray.push(new THREE.Vector3(1.0, 1.0, 1.0));
        this.ExpanArray.push(new THREE.Vector3());

        this.setMeinMeshMaterial();
        this.setExMaterial();

        super.addParent(this.faceObject);
        super.addParent(this.exMesh);
    }

    initMopthKeys() {
        let keys = Object.keys(this.faceMesh.morphTargetDictionary);
        for (let m = 0; m < keys.length; m++) {
            this.faceMesh.morphTargetInfluences[m] = 0;
        }

        keys = Object.keys(this.exMesh.morphTargetDictionary);
        for (let m = 0; m < keys.length; m++) {
            this.exMesh.morphTargetInfluences[m] = 0;
        }
    }

    setMeinMeshMaterial() {
        const tgt = super._getMatbyName(this.faceMesh, 'mat_faceBase');

        if (tgt) {
            const phongShader = THREE.ShaderLib['phong'];
            const uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

            uniforms.diffuse.value = tgt.material.color;
            //uniforms.shininess.value =object.children[i].children[m].material.shininess;
            uniforms.emissive.value = tgt.material.emissive;
            // uniforms.specular.value = object.children[i].children[m].material.specular;

            uniforms.map = { type: 't', value: tgt.material.map };
            uniforms.u_v3Col1 = { type: 'v3v', value: this.ColArray };

            uniforms.expanValue = { type: 'f', value: 0.0 };

            uniforms.u_v3Expan = {
                type: 'v3v',
                value: this.ExpanArray,
            };

            const defines = {};
            defines['USE_MAP'] = '';

            let F_shaderStr =
                super.getF_header() +
                super.getF_useCol1Array(8) +
                super.getF_useLightCrip() +
                super.getF_UseConvertHSV();

            F_shaderStr =
                F_shaderStr +
                `

            void main() {	
              // 顔は、眼や口の中に関しては輪郭を付けないので、discardしている
              if(expanValue > 0.0) {
                  if(stepVal > vUv.x || (stepVal * 2.0 < vUv.x && stepVal * 6.0 > vUv.x ) || stepVal * 7.0 < vUv.x  ){
                    discard;
                }
              }
          
              #include <clipping_planes_fragment>	
          
              vec4 diffuseColor = vec4( diffuse, opacity );
              ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
              vec3 totalEmissiveRadiance = emissive; 
          
              vec4 texelColor = texture2D( map, vUv );

          ` +
                super.getF_inMethod_THREEIncluder1() +
                super.getF_inMethod_MainColorDetect() +
                super.getF_inMethod_THREEIncluder2() +
                `}`;

            const material = new THREE.ShaderMaterial({
                skinning: true,
                morphTargets: true,
                uniforms: uniforms,
                defines: defines,
                vertexShader: super.getEdgeVShader(),
                fragmentShader: F_shaderStr,
                lights: true,
                depthTest: true,
                transparent: false,
                blending: THREE.NormalBlending,
                fog: true,
            });

            tgt.material = material;

            tgt.onBeforeRender = super.getOnBeforeRender;
            tgt.onAfterRender = super.getOnAfterRender;

            this.faceMeshMaterial = tgt.material;
        }
    }

    setExMaterial() {
        const tgt = super._getMatbyName(this.exMesh, 'mat_face_ex');

        if (tgt) {
            const phongShader = THREE.ShaderLib['phong'];
            const uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

            uniforms.diffuse.value = tgt.material.color;
            //uniforms.shininess.value =object.children[i].children[m].material.shininess;
            uniforms.emissive.value = tgt.material.emissive;
            // uniforms.specular.value = object.children[i].children[m].material.specular;

            uniforms.map = { type: 't', value: tgt.material.map };
            uniforms.u_v3Col1 = { type: 'v3v', value: this.ColArray };

            uniforms.expanValue = { type: 'f', value: 0.0 };

            const defines = {};
            defines['USE_MAP'] = '';

            let F_shaderStr = `
            #define PHONG 
            uniform vec3 diffuse;
            uniform vec3 emissive;
            uniform vec3 specular;
            uniform float shininess;
            uniform float opacity;
            
            #include <common>
            #include <packing>
            #include <dithering_pars_fragment>
            #include <color_pars_fragment>
            #include <uv_pars_fragment>
            #include <uv2_pars_fragment>
            #include <map_pars_fragment>
            #include <alphamap_pars_fragment>
            #include <aomap_pars_fragment>
            #include <lightmap_pars_fragment>
            #include <emissivemap_pars_fragment>
            #include <envmap_pars_fragment>
            #include <gradientmap_pars_fragment>
            #include <fog_pars_fragment>
            #include <bsdfs>
            #include <lights_pars_begin>
            #include <lights_phong_pars_fragment>
            #include <shadowmap_pars_fragment>
            #include <bumpmap_pars_fragment>
            #include <normalmap_pars_fragment>
            #include <specularmap_pars_fragment>
            #include <logdepthbuf_pars_fragment>
            #include <clipping_planes_pars_fragment>
            
            const vec3 WHITE = vec3(1.0);
            
            void main() {	
            
                #include <clipping_planes_fragment>	
                
                //vec4 diffuseColor = vec4( diffuse, opacity );
                vec4 diffuseColor =vec4(1.0,1.0,1.0,1.0);
                ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
                vec3 totalEmissiveRadiance = emissive; 
            
                #include <map_fragment>
                #include <alphamap_fragment>	
                #include <alphatest_fragment>	
            
                diffuseColor = texture2D( map, vUv );
                gl_FragColor = vec4(diffuseColor.xyz * 1.3, mix(1.0, 1.0 - vUv.y, step( 0.125, vUv.x)) );
            
            }
            `;

            const material = new THREE.ShaderMaterial({
                skinning: true,
                morphTargets: true,
                uniforms: uniforms,
                defines: defines,
                vertexShader: phongShader.vertexShader,
                fragmentShader: F_shaderStr,
                lights: true,
                depthTest: true,
                transparent: true,
                blending: THREE.NormalBlending,
                fog: true,
            });

            tgt.material = material;
            /*
          tgt.onBeforeRender = super.getOnBeforeRender;
          tgt.onAfterRender = super.getOnAfterRender;
*/
        }
    }

    /////////////////////////////////////////////////////////

    changeCol_hair(_vec) {
        this.faceMeshMaterial.uniforms.u_v3Col1.value[2].set(
            _vec.r,
            _vec.g,
            _vec.b
        );
        this.faceMeshMaterial.uniforms.u_v3Col1.value.needsUpdate = true;
    }

    changeCol_Eye(_vec) {
        this.faceMeshMaterial.uniforms.u_v3Col1.value[3].set(
            _vec.r,
            _vec.g,
            _vec.b
        );
        this.faceMeshMaterial.uniforms.u_v3Col1.value.needsUpdate = true;
    }

    changeVal_Turime(_val) {
        this.faceMesh.morphTargetInfluences[
            this.faceMesh.morphTargetDictionary.eye_type2
        ] = _val;
    }

    changeVal_Eye_Bold(_val) {
        this.faceMesh.morphTargetInfluences[
            this.faceMesh.morphTargetDictionary.gankyu_hoso
        ] = _val;
        this.exMesh.morphTargetInfluences[
            this.exMesh.morphTargetDictionary.gankyu_hoso
        ] = _val;
    }

    changeVal_Eye_Type(_type, _val) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.eye_type,
            this.mopthArray
        );
        super.setMopth(_val < 0 ? 1.0 : _val, _type, this.mopthArray);
        /*
      if(!_type || _type.length === 0) { return; }


      this.faceMesh.morphTargetInfluences[this.faceMesh.morphTargetDictionary[_type]] =  _val < 0 ? 1.0 :_val;
      this.exMesh.morphTargetInfluences[this.exMesh.morphTargetDictionary[_type]] = _val < 0 ? 1.0 : _val;
*/
    }

    changeVal_Blow_Type(_type, _val) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.mayu_type,
            this.mopthArray
        );
        super.setMopth(_val < 0 ? 1.0 : _val, _type, this.mopthArray);
        /*
      if(!_type || _type.length === 0) { return; }

      this.faceMesh.morphTargetInfluences[this.faceMesh.morphTargetDictionary[_type]] =  _val < 0 ? 1.0 :_val;
      this.exMesh.morphTargetInfluences[this.exMesh.morphTargetDictionary[_type]] = _val < 0 ? 1.0 : _val;
      */
    }

    changeVal_Mouth_Type(_type, _val) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.mouth_type,
            this.mopthArray
        );
        if (!_type || _type.length === 0) {
            return;
        }

        if (
            _type !=
            Engine.gameScene.editableSetting.editableItems.mouth_type[0].value
        ) {
            this.faceMesh.morphTargetInfluences[
                this.faceMesh.morphTargetDictionary[_type]
            ] = _val < 0 ? 1.0 : _val;
            this.faceMesh.morphTargetInfluences[
                this.faceMesh.morphTargetDictionary[
                    Engine.gameScene.editableSetting.editableItems.mouth_type[0].value
                ]
            ] = 1.0 - _val;
        } else {
            this.faceMesh.morphTargetInfluences[
                this.faceMesh.morphTargetDictionary[_type]
            ] = 1.0;
        }

        //this.exMesh.morphTargetInfluences[this.exMesh.morphTargetDictionary[_type]] = _val < 0 ? 1.0 : _val;
    }

    changeVal_face_cheek(_val) {
        this.exMesh.morphTargetInfluences[
            this.exMesh.morphTargetDictionary.akami_use
        ] = _val;
    }

    changeVal_face_gaan(_val) {
        this.exMesh.morphTargetInfluences[
            this.exMesh.morphTargetDictionary.aomi_use
        ] = _val;
    }

    changeVal_ExEye(_type) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.ExEye_type,
            this.mopthArray
        );
        super.setMopth(1.0, _type, this.mopthArray);
        /*
      if(!_type || _type.length === 0) { return; }

      this.faceMesh.morphTargetInfluences[this.faceMesh.morphTargetDictionary[_type]] =  1.0;
      this.exMesh.morphTargetInfluences[this.exMesh.morphTargetDictionary[_type]] = 1.0;
*/
    }

    changeVal_body_color(_vec) {
        this.faceMeshMaterial.uniforms.u_v3Col1.value[1].copy(_vec);
        this.faceMeshMaterial.uniforms.u_v3Col1.value.needsUpdate = true;
    }
}

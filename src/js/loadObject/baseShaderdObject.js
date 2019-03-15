export default class baseShaderdObject {
    constructor(_parent) {
        this.parent = _parent;
    }

    addParent(_mesh) {
        this.parent.children.push(_mesh);
        _mesh.parent = this.parent;
    }

    initMopthDictionaryArray() {
        this.mopthDictionaryArray = [];

        if (this.mopthArray) {
            for (let i = 0; i < this.mopthArray.length; i++) {
                this.mopthDictionaryArray[i] = Object.keys(
                    this.mopthArray[i].morphTargetDictionary
                );
                for (let m = 0; m < this.mopthDictionaryArray[i].length; m++) {
                    this.mopthArray[i].morphTargetInfluences[m] = 0;
                }
            }
        }
    }

    initArrayedMopth(_array, _meshArray) {
        for (let i = 0; i < _array.length; i++) {
            const type = _array[i].value ? _array[i].value : _array[i];
            if (type.length === 0) {
                continue;
            }

            for (let m = 0; m < _meshArray.length; m++) {
                if (
                    _meshArray[m].morphTargetInfluences[
                        _meshArray[m].morphTargetDictionary[type]
                    ] != undefined
                ) {
                    _meshArray[m].morphTargetInfluences[
                        _meshArray[m].morphTargetDictionary[type]
                    ] = 0.0;
                }
            }
        }
    }

    setMopth(_val, _type, _meshArray) {
        if (!_type || _type.length === 0) {
            return;
        }
        const type = _type.value ? _type.value : _type;

        for (let m = 0; m < _meshArray.length; m++) {
            if (
                _meshArray[m].morphTargetInfluences[
                    _meshArray[m].morphTargetDictionary[type]
                ] != undefined
            ) {
                _meshArray[m].morphTargetInfluences[
                    _meshArray[m].morphTargetDictionary[type]
                ] = _val;
            }
        }
    }

    getOnBeforeRender(_renderer, _scene, _camera, _geometry, _material) {
        _renderer.context.frontFace(_renderer.context.CCW);
        _material.uniforms.expanValue.value = 0.0;
        // _material.uniforms.edigeMode.value = 0.0;
        _material.uniformsNeedUpdate = true;
    }

    getOnAfterRender(_renderer, _scene, _camera, _geometry, _material, _group) {
        _renderer.context.frontFace(_renderer.context.CW);
        _material.uniforms.expanValue.value = 0.001;
        //_material.uniforms.edigeMode.value = 1.0;
        _material.uniformsNeedUpdate = true;
        _renderer.renderBufferDirect(
            _camera,
            _scene.fog,
            _geometry,
            _material,
            this,
            _group
        );
        _renderer.context.frontFace(_renderer.context.CCW);
    }

    _getObjectByName(_o, _name) {
        let refO = null;

        if (_o.name.indexOf(_name) > -1) {
            return _o;
        }

        for (let i = 0; i < _o.children.length; i++) {
            refO = this._getObjectByName(_o.children[i], _name);
            if (refO) {
                break;
            }
        }
        return refO;
    }

    _getMatbyName(_o, _name) {
        let refO = null;

        if (_o.material && _o.material.name.indexOf(_name) > -1) {
            return _o;
        }

        if (_o.materials) {
            for (let i = 0; i < _o.materials.length; i++) {
                refO = this._getMatbyName(_o.materials[i], _name);
                if (refO) {
                    return refO;
                }
            }
        }

        for (let i = 0; i < _o.children.length; i++) {
            refO = this._getMatbyName(_o.children[i], _name);
            if (refO) {
                return refO;
            }
        }

        return refO;
    }

    ////////////

    getEdgeVShader(_arrayCount) {
        const arrayCount = _arrayCount ? _arrayCount : 8;

        let refStr = `

    #define PHONG
    varying vec3 vViewPosition;
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif
    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>

    varying       vec3    normalPass;
     
    uniform float expanValue;

    const float stepVal = ${1.0 / arrayCount};

    uniform vec3 u_v3Expan[${arrayCount}];
    `;

        refStr += `
    vec3 getExpanValue(float v) {
        return 
    `;
        for (let i = 0; i < arrayCount - 1; i++) {
            refStr += `mix(u_v3Expan[${i}],`;
        }
        refStr += `u_v3Expan[${arrayCount - 1}],`;
        for (let i = arrayCount; i > 1; i--) {
            refStr += `step(stepVal * ${i - 1}.0, v))`;
            refStr += i > 2 ? ',' : ';\n';
        }

        refStr += '}';

        /*
        // 拡張頂点値の中の該当Indexを返す  もっといい書き方はねーのか
        vec3 getExpanValue(float v) {

          return mix(u_v3Expan[0],
            mix(u_v3Expan[1],
              mix(u_v3Expan[2],
                mix(u_v3Expan[3],
                  mix(u_v3Expan[4],
                    mix(u_v3Expan[5],
                      mix(u_v3Expan[6],
                        mix(u_v3Expan[7], WHITE, step(stepVal * 8.0, v)),
                        step(stepVal * 7.0, v)),
                      step(stepVal * 6.0, v)),
                    step(stepVal * 5.0, v)),
                  step(stepVal * 4.0, v)),
                step(stepVal * 3.0, v)),
              step(stepVal * 2.0, v)),
            step(stepVal, v));
        }
    */

        refStr += `

    void main() {
        #include <uv_vertex>
        #include <uv2_vertex>
        #include <color_vertex>
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
    #ifndef FLAT_SHADED
        vNormal = normalize( transformedNormal );
    #endif
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
            
        #include <displacementmap_vertex>

        //include <project_vertex>
        
        float useExpan = getExpanValue(vUv.x).x * expanValue;
        vec4 mvPosition = modelViewMatrix * vec4( transformed + objectNormal * useExpan, 1.0 );
        gl_Position = projectionMatrix * mvPosition ;

        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>

        vViewPosition = - mvPosition.xyz;

        #include <worldpos_vertex>
        #include <envmap_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>

        normalPass  = (modelViewMatrix *  vec4(normal, 1.0)).xyz; 
        
    }
        `;

        return refStr;
    }

    ///////////////////////

    getF_header() {
        return `
                
    #define PHONG 
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;

    uniform float expanValue;

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

    const vec3 BLACK = vec3(0.0);
    const vec3 BLACK2 = vec3(0.01,0.05,0.08);
    const vec3 WHITE = vec3(1.0);
    const vec3 WHITE2 = vec3(0.999, 0.999, 0.999);
    const float Epsilon = 1e-10;
    
    `;
    }

    getF_useCol1Array(_arrayCount) {
        const arrayCount = _arrayCount ? _arrayCount : 8;

        let refStr = `
                
            const float stepVal = ${1.0 / arrayCount};

            uniform vec3 u_v3Col1[${arrayCount}];
            
            // 配列カラーの中の該当Indexを返す  もっといい書き方はねーのか
            vec3 getCol1(float v) {
                
                return 
        `;

        for (let i = 0; i < arrayCount - 1; i++) {
            refStr += `mix(u_v3Col1[${i}],`;
        }
        refStr += `u_v3Col1[${arrayCount - 1}],`;
        for (let i = arrayCount; i > 1; i--) {
            refStr += `step(stepVal * ${i - 1}.0, v))`;
            refStr += i > 2 ? ',' : ';\n';
        }

        refStr += '}';

        return refStr;
    }

    getF_useCol1Array_8() {
        return `
        
    const float stepVal = 0.125;

    uniform vec3 u_v3Col1[8];
    
    // 8カラーの中の該当Indexを返す  もっといい書き方はねーのか
    vec3 getCol1(float v) {
        
        return mix(u_v3Col1[0], 
                    mix(u_v3Col1[1],
                        mix(u_v3Col1[2],
                            mix(u_v3Col1[3],
                                mix(u_v3Col1[4],
                                    mix(u_v3Col1[5],    
                                        mix(u_v3Col1[6],
                                            mix(u_v3Col1[7],WHITE, step(stepVal * 8.0, v)),
                                            step(stepVal * 7.0, v)), 
                                        step(stepVal * 6.0, v)), 
                                    step(stepVal * 5.0, v)), 
                                step(stepVal * 4.0, v)), 
                            step(stepVal * 3.0, v)), 
                        step(stepVal * 2.0, v)), 
                    step(stepVal, v));
    }
    `;
    }

    getF_useCol1Array_10() {
        return `
        
    const float stepVal = 0.1;

    uniform vec3 u_v3Col1[10];
    
    // カラーの中の該当Indexを返す  もっといい書き方はねーのか
    vec3 getCol1(float v) {
        
        return mix(u_v3Col1[0], 
                    mix(u_v3Col1[1],
                        mix(u_v3Col1[2],
                            mix(u_v3Col1[3],
                                mix(u_v3Col1[4],
                                    mix(u_v3Col1[5],    
                                        mix(u_v3Col1[6],
                                            mix(u_v3Col1[7],
                                                mix(u_v3Col1[8],u_v3Col1[9],
                                                    step(stepVal * 9.0, v)), 
                                                step(stepVal * 8.0, v)),
                                            step(stepVal * 7.0, v)), 
                                        step(stepVal * 6.0, v)), 
                                    step(stepVal * 5.0, v)), 
                                step(stepVal * 4.0, v)), 
                            step(stepVal * 3.0, v)), 
                        step(stepVal * 2.0, v)), 
                    step(stepVal, v));
    }
    `;
    }

    getF_useCol2() {
        return `

    vec3 getCol2(vec4 _col){
        return  mix(u_v3Col1[1],
                    mix(u_v3Col1[2],
                        mix(u_v3Col1[3],
                            mix(u_v3Col1[4],
                                u_v3Col1[5],
                                step(_col.b, 0.5)),
                            step(_col.g, 0.5)),
                        step(_col.r, 0.5)),
                    step(_col.r + _col.g + _col.b, 2.5));
        }

      `;
    }

    getF_useCol1Array_1() {
        return `      
    
    const float stepVal = 0.125;

        uniform vec3 u_v3Col1[2];
        
        // 8カラーの中の該当Indexを返す ダミー
        vec3 getCol1(float v) {            
            return u_v3Col1[0];
        }
        `;
    }

    getF_useExColArray_8() {
        return `

      uniform vec3 u_v3exFactors[8];
        
      // 8カラーの中の該当Indexを返す 
      vec3 getexFactor(float v) {            
          return mix(u_v3exFactors[0], 
                      mix(u_v3exFactors[1],
                          mix(u_v3exFactors[2],
                              mix(u_v3exFactors[3],
                                  mix(u_v3exFactors[4],
                                      mix(u_v3exFactors[5],    
                                          mix(u_v3exFactors[6],
                                              mix(u_v3exFactors[7],WHITE, step(stepVal * 8.0, v)),
                                          step(stepVal * 7.0, v)), 
                                      step(stepVal * 6.0, v)), 
                                  step(stepVal * 5.0, v)), 
                              step(stepVal * 4.0, v)), 
                          step(stepVal * 3.0, v)), 
                      step(stepVal * 2.0, v)), 
                 step(stepVal, v));
      }
      
      `;
    }

    getF_useLightCrip() {
        return `

    const float F_Lclip01 = 1.0; //0.875;
    const float F_Lclip02 = 0.775;
    const float F_Lclip03 = 0.55; //0.50;
    const float F_Lclip04 = 0.30;
    
    const float F_LowClip = 0.1;
    
    const float FP_12_add = F_Lclip01; //F_Lclip01 + 0.05;
    const float FP_23_add = F_Lclip03 + 0.05; //0.075;
    const float FP_34_add = F_Lclip04 + 0.1;
    
    
    const float val1 = 1.0;
    const float val2 = 0.9;
    const float val3 = 0.775;
    const float val4 = 0.55;
    const float val5 = 0.35;
    const float val6 = 0.10;

    const float clip1 = 1.0;
    const float clip2 = 0.85;
    const float clip3 = 0.7;
    const float clip4 = 0.45;
    const float clip5 = 0.30;
    const float clip6 = 0.10;

    float lightingClip(float _f) {
    
        return  mix(
                    mix(
                        mix(
                            mix(
                                mix(
                                    mix(
                                        mix(
                                            mix( 
                                                mix(
                                                    mix(val6, val5, smoothstep(clip6, clip5, _f)),
                                                    val5,
                                                    step(clip5, _f)
                                                ),
                                                val4,
                                                smoothstep(clip5, clip4, _f)
                                            ),
                                            val4,
                                            step(clip4, _f)
                                        ),
                                        val3,
                                        smoothstep(clip4, clip3, _f)
                                    ),   
                                    val3,
                                    step(clip3, _f)
                                ),
                                val2,
                                smoothstep(clip3, clip2, _f)
                            ),  
                            val2,
                            step(clip2, _f)
                        ),		
                        val1,
                        smoothstep(clip2, clip1, _f)
                    ),
                    val1,
                    step(clip1,_f)
                );

    }
    
  
    float _lightingClip(float f) {
    
        return 
            mix(F_LowClip,
                mix(F_Lclip04,
                    mix(F_Lclip03,
                        mix(F_Lclip02,
                            F_Lclip01,
                            smoothstep(F_Lclip02,FP_12_add,f)
                        ),
                        smoothstep(F_Lclip03,FP_23_add,f)
                    ),
                    smoothstep(F_Lclip04, FP_34_add,f)
                ),
                smoothstep(F_LowClip,F_Lclip04,f)
            );
    
    }
    

    float lightingClip2(float f) {
    
        return 
            mix(F_LowClip,
                mix(F_Lclip04,
                    mix(F_Lclip03,
                        mix(F_Lclip02,
                            F_Lclip01,
                            smoothstep(F_Lclip02,FP_12_add,f)
                        ),
                        smoothstep(F_Lclip03,FP_23_add,f)
                    ),
                    smoothstep(F_Lclip04, FP_34_add,f)
                ),
                smoothstep(F_LowClip,F_Lclip04,f)
            );
    
    }


    `;
    }

    getF_useLightCrip_hair() {
        return `
    
        const float F_Lclip01 = 0.875;
        const float F_Lclip02 = 0.775;
        const float F_Lclip03 = 0.50;
        const float F_Lclip04 = 0.30;
        
        const float F_LowClip = 0.25; //0.25;
        
        const float FP_12_add = F_Lclip01; //F_Lclip01 + 0.05;
        const float FP_23_add = F_Lclip03 + 0.075;
        const float FP_34_add = F_Lclip04 + 0.1;
        
        float lightingClip(float f) {
            return mix(F_LowClip, 1.0, f);
        }
        
    `;
    }

    getF_UseConvertHSV() {
        return `

        // thanks to http://www.chilliant.com/rgb2hsv.html
        ///////////////
        
        vec3 HUEtoRGB(float H)
        {
            H = mix(H + 1.0,H, step(0.0,H));
            float R = abs(H * 6.0 - 3.0) - 1.0;
            float G = 2.0 - abs(H * 6.0 - 2.0);
            float B = 2.0 - abs(H * 6.0 - 4.0);
            return saturate(vec3(R,G,B));
        }
        vec3 RGBtoHCV(vec3 RGB)
        {
            // Based on work by Sam Hocevar and Emil Persson
            vec4 P = (RGB.g < RGB.b) ? vec4(RGB.bg, -1.0, 2.0/3.0) : vec4(RGB.gb, 0.0, -1.0/3.0);
            vec4 Q = (RGB.r < P.x) ? vec4(P.xyw, RGB.r) : vec4(RGB.r, P.yzx);
            float C = Q.x - min(Q.w, Q.y);
            float H = abs((Q.w - Q.y) / (6.0 * C + Epsilon) + Q.z);
            return vec3(H, C, Q.x);
        }
        
        vec3 RGBtoHSL(vec3 RGB)
        {
            vec3 HCV = RGBtoHCV(RGB);
            float L = HCV.z - HCV.y * 0.5;
            float S = HCV.y / (1.0 - abs(L * 2.0 - 1.0) + Epsilon);
            return vec3(HCV.x, S, L);
        }        
        
        vec3 HSLtoRGB(vec3 HSL)
        {
            vec3 RGB = HUEtoRGB(HSL.x);
            float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
            return (RGB - 0.5) * C + HSL.z;
        }

        vec3 HSVtoRGB(vec3 HSV)
        {
           vec3 RGB = HUEtoRGB(HSV.x);
          return ((RGB - 1.0) * HSV.y + 1.0) * HSV.z;
        }
    `;
    }

    getF_inMethod_THREEIncluder1() {
        return `
    
        #include <logdepthbuf_fragment>	
        #include <color_fragment>	
        #include <alphamap_fragment>	
        #include <alphatest_fragment>	
        #include <specularmap_fragment>	
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>	

        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>

        #include <aomap_fragment>	

      `;
    }

    getF_inMethod_MainColorDetect() {
        return `  

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular ;	

        #include <envmap_fragment>

        vec3 col1 = getCol1(vUv.x);

        // HSL化したときに 1 or 0 だと彩度がセットできないため、わずかながらにずらす
        float colLen = length(col1);
        col1 = mix(col1, WHITE2, step(1.73, colLen));
        col1 = mix(BLACK2, col1, step(0.1, colLen));

        // anime col convert    
        float lightLen = (outgoingLight.r + outgoingLight.g + outgoingLight.b) * 0.333;
        
        //get HSL
        vec3 hsl = RGBtoHSL(col1);
        float firstL = hsl.z;
        float h_xVect = sign(hsl.x - 0.5);

        //////////////////////////////////////
        //light clipping
        hsl.z =  mix(hsl.z, hsl.z - (0.5 - lightLen) * hsl.z * 0.6, (1.0 - vUv.y));
        
        hsl.z =  lightingClip(hsl.z  * mix(0.2,1.0, step(expanValue, 0.00001)));
        hsl.z =  mix(hsl.z * (1.0 - vUv.y), hsl.z, (1.0 - vUv.y));
        
        //change H from L
        //hsl.x =  mix(hsl.x + firstL * abs(sin(hsl.x * 3.14))  * 0.3 * h_xVect  * max(sin(hsl.x * 9.42),0.0), hsl.x, min(lightLen, 1.0) );
        hsl.x =  mix(hsl.x + firstL * abs(sin(hsl.x * 3.14))  * 0.3 * h_xVect  * max(sin(hsl.x * 9.42),0.0), hsl.x, min(sin(lightLen * 1.57), 1.0) );
        
        //to RGB
        gl_FragColor = vec4(HSLtoRGB(hsl) * directLight.color, 1.0 ) ;
        gl_FragColor = vec4(gl_FragColor.xyz + ambientLightColor, 1.0 ) ;
    

    `;
    }

    getF_inMethod_THREEIncluder2() {
        return `  

    #include <premultiplied_alpha_fragment>	
    #include <tonemapping_fragment>	
    #include <encodings_fragment>	
    #include <fog_fragment>    

    `;
    }

    ///////////////////
}

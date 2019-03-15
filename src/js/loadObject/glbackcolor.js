export default class glbackcolor extends THREE.Object3D {
  constructor() {
    super();
  };

  load(_editableSetting) {

    const geometry = new THREE.PlaneGeometry(2, 2, 1);
    const basemat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });

    this.linkSetting = _editableSetting;
    const phongShader = THREE.ShaderLib['phong'];
    const uniforms = THREE.UniformsUtils.clone(basemat.uniforms);

    //uniforms.map = {type:"t", value:tgt.material.map};                            
    uniforms.u_v3Col1 = {
      type: "v3",
      value: new THREE.Vector3(1, 0, 0)
    };
    uniforms.u_v3Col2 = {
      type: "v3",
      value: new THREE.Vector3(0, 1, 0)
    };
    uniforms.u_v3Col3 = {
      type: "v3",
      value: new THREE.Vector3(0, 0, 1)
    };

    const defines = {};
    defines["USE_MAP"] = "";

    const V_shaderStr = `
    
        void main() {

            gl_Position = vec4(position.x, position.y, 0.0000001, 1.0);
            
        }
            `;


    const F_shaderStr = `

        #define resolution vec2( ${Engine.container.clientWidth * Engine.ViewerRatio}.0, ${Engine.container.clientHeight * Engine.ViewerRatio}.0 )

        uniform vec3 u_v3Col1;
        uniform vec3 u_v3Col2;
        uniform vec3 u_v3Col3;
    
            void main() {	
                vec2 pos2 = gl_FragCoord.xy/resolution;
                vec3 putCol = mix(mix(u_v3Col3, u_v3Col2, smoothstep( 0.0, 0.5, pos2.y)),
                                 mix(u_v3Col2, u_v3Col1, smoothstep( 0.5, 1.0, pos2.y)),
                                 step(0.5, pos2.y));
                
                gl_FragColor = vec4(putCol, 1.0 ) ;            
           }`;


    this.material = new THREE.ShaderMaterial({
      skinning: false,
      //morphTargets: true,
      uniforms: uniforms,
      defines: defines,
      vertexShader: V_shaderStr,
      fragmentShader: F_shaderStr,
      lights: false,
      depthTest: false,
      transparent: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      fog: false
    });

    this.mesh = new THREE.Mesh(geometry, this.material );

  };

  init(_setting) {

    this.changeCol_1(new THREE.Color(Math.random()*0.2 + 0.8, Math.random()*0.2 + 0.8,  Math.random()*0.2 + 0.8 ));
    this.changeCol_2(new THREE.Color(Math.random()*0.2 + 0.8, Math.random()*0.2 + 0.8,  Math.random()*0.2 + 0.8 ));
    this.changeCol_3(new THREE.Color(Math.random()*0.2 + 0.8, Math.random()*0.2 + 0.8,  Math.random()*0.2 + 0.8 ));

    Engine.scene.add(this.mesh);

  };

  updateFrame(_delta) {

  }

  //// このクラスに関してはゆりgenエディターのみの使用になるため、直接EditSettingに書いてる

  changeCol_1(_col){
    this.material.uniforms.u_v3Col1.value.set(_col.r,_col.g, _col.b);
    this.material.uniforms.u_v3Col1.needsUpdate = true;
    this.linkSetting.setting.bc1 = _col; 
  }

  changeCol_2(_col){
    this.material.uniforms.u_v3Col2.value.set(_col.r,_col.g, _col.b);
    this.material.uniforms.u_v3Col2.needsUpdate = true;
    this.linkSetting.setting.bc2 = _col; 
  }

  changeCol_3(_col){
    this.material.uniforms.u_v3Col3.value.set(_col.r,_col.g, _col.b);
    this.material.uniforms.u_v3Col3.needsUpdate = true;
    this.linkSetting.setting.bc3 = _col; 
  }

}
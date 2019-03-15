window.OreShaderMake = window.OreShaderMake ? window.OreShaderMake : {};

window.OreShaderMake.F_headers = `

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

`;

window.OreShaderMake.F_useCol1Array = `
      
uniform vec3 u_v3Col1[8];

const float stepVal = 0.125;
const vec3 BLACK = vec3(0.0);
const vec3 BLACK2 = vec3(0.02,0.01,0.0);
const vec3 WHITE = vec3(1.0);
const vec3 WHITE2 = vec3(0.999,0.999,1.0);
const float Epsilon = 1e-10;

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

window.OreShaderMake.F_useCol1Solo = `
      
uniform vec3 u_v3Col1;

const float stepVal = 0.125;
const vec3 BLACK = vec3(0.0);
const vec3 BLACK2 = vec3(0.02,0.01,0.0);
const vec3 WHITE = vec3(1.0);
const vec3 WHITE2 = vec3(0.999,0.999,1.0);
const float Epsilon = 1e-10;

// 8カラーの中の該当Indexを返す ダミー
vec3 getCol1(float v) {
    
    return u_v3Col1;
}
`;

window.OreShaderMake.F_useExColArray = `

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

window.OreShaderMake.F_useLightCrip = `

const float F_Lclip01 = 0.875;
const float F_Lclip02 = 0.775;
const float F_Lclip03 = 0.50;
const float F_Lclip04 = 0.30;

const float F_LowClip = 0.1;

const float FP_12_add = F_Lclip01; //F_Lclip01 + 0.05;
const float FP_23_add = F_Lclip03 + 0.075;
const float FP_34_add = F_Lclip04 + 0.1;

float lightingClip(float f) {

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

window.OreShaderMake.F_useLightCrip_Hair = `

const float F_Lclip01 = 0.875;
const float F_Lclip02 = 0.775;
const float F_Lclip03 = 0.50;
const float F_Lclip04 = 0.30;

const float F_LowClip = 0.1;

const float FP_12_add = F_Lclip01; //F_Lclip01 + 0.05;
const float FP_23_add = F_Lclip03 + 0.075;
const float FP_34_add = F_Lclip04 + 0.1;

float lightingClip(float f) {
    return mix(F_Lclip04, 1.0, f);
}

`;

window.OreShaderMake.F_UseConvertHSV = `

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

`;

window.OreShaderMake.F_useExpan = `

uniform float expanValue;

`;

window.OreShaderMake.F_useHairEdgeMode = `

uniform float edigeMode;

`;

window.OreShaderMake.F_oreSelShaderBase = function(_colorDetectStr) {
    return (
        `

void main() {	

    if(expanValue > 0.0) {
        if(stepVal > vUv.x || stepVal * 2.0 < vUv.x ){
            discard;
        }
    }

    #include <clipping_planes_fragment>	

    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive; 

    #include <logdepthbuf_fragment>	

    vec4 texelColor = texture2D( map, vUv );
        
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
    
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular ;	
    
    #include <envmap_fragment>

    //gl_FragColor = vec4( outgoingLight, diffuseColor.a ) * texelColor.a;	 

    //vec4 tex2 = texture2D(selltex, vec2(0.0, difpow )); 
    //gl_FragColor = tex2 * texelColor  + vec4(reflectedLight.indirectDiffuse + totalEmissiveRadiance , 0.0);
    
    vec3 col1 = getCol1(vUv.x);

    // HSL化したときに 1 or 0 だと彩度がセットできないため、わずかながらにずらす
    float colLen = length(col1);
    col1 = mix(col1, WHITE2, step(1.73, colLen));
    col1 = mix(BLACK2, col1, step(0.1, colLen));

    // anime col convert    

    float lightLen = length(outgoingLight) * 0.6;
    
    //get HSL
    vec3 hsl = RGBtoHSL(col1);
    float firstL = hsl.z;
    ` +
        _colorDetectStr +
        `
    //debug put use
    //gl_FragColor = vec4(lightLen,lightLen,lightLen, 1.0);

    #include <premultiplied_alpha_fragment>	
    #include <tonemapping_fragment>	
    #include <encodings_fragment>	
    #include <fog_fragment>
    
}
`
    );
};

window.OreShaderMake.getF_OreOhadaShader = function() {
    return (
        window.OreShaderMake.F_headers +
        window.OreShaderMake.F_useCol1Array +
        window.OreShaderMake.F_useExColArray +
        window.OreShaderMake.F_useLightCrip +
        window.OreShaderMake.F_UseConvertHSV +
        window.OreShaderMake.F_useExpan +
        window.OreShaderMake.F_oreSelShaderBase(
            window.OreShaderMake.F_FaceColorDetect
        )
    );
};

////////

window.OreShaderMake.F_FaceColorDetect = `

//light clipping
hsl.z =  mix(hsl.z, hsl.z - (0.5 - lightLen) * hsl.z * 0.6, (1.0 - vUv.y));
hsl.z =  lightingClip(hsl.z  * mix(0.2,1.0, step(expanValue, 0.00001)));
hsl.z =  mix(hsl.z * (1.0 - vUv.y), hsl.z, (1.0 - vUv.y));

//change H from L
//hsl.x =  mix(hsl.x - hsl.z * 0.075, hsl.x, min(lightLen, 1.0) );
hsl.x =  mix(hsl.x - firstL * 0.075, hsl.x, min(lightLen, 1.0) );

//to RGB
gl_FragColor = vec4(HSLtoRGB(hsl) * directLight.color, 1.0 ) ;
gl_FragColor = vec4(gl_FragColor.xyz + ambientLightColor, 1.0 ) ;

`;

window.OreShaderMake.getF_OreHairShader = function() {
    return (
        window.OreShaderMake.F_headers +
        window.OreShaderMake.F_useCol1Solo +
        //window.OreShaderMake.F_useExColArray +
        window.OreShaderMake.F_useLightCrip_Hair +
        window.OreShaderMake.F_UseConvertHSV +
        window.OreShaderMake.F_useExpan +
        window.OreShaderMake.F_oreSelShaderBase(
            window.OreShaderMake.F_HairColorDetect
        )
    );
};

window.OreShaderMake.F_HairColorDetect = `

//light clipping
hsl.z =  mix(hsl.z, hsl.z - (0.5 - lightLen) * hsl.z * 0.6, lightLen);
hsl.z =  lightingClip(hsl.z * lightLen);
hsl.z =  mix(hsl.z, hsl.z - (1.0 - texelColor.x) * 0.75, hsl.z);

//change H from L
hsl.x =  mix(hsl.x - firstL * 0.075, hsl.x, min(lightLen, 1.0) );

//to RGB
gl_FragColor = vec4(HSLtoRGB(hsl) * directLight.color, 1.0 ) ;
gl_FragColor = vec4(gl_FragColor.xyz + ambientLightColor, 1.0 ) ;

`;

//////////////////

window.OreShaderMake.getF_OreFaceExColor = function() {
    return `

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
    vec4 diffuseColor = texture2D( map, vUv );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive; 

    #include <map_fragment>
    #include <alphamap_fragment>	
    #include <alphatest_fragment>	

    gl_FragColor = vec4(diffuseColor.xyz, 1.0 - vUv.y);

}
`;
};

//////////////////////////////

////////////////////////

window.OreShaderMake.getV_useEdgeVS = function() {
    return `

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
        
        vec4 mvPosition = modelViewMatrix * vec4( transformed + objectNormal * expanValue, 1.0 );
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
};

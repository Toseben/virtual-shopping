import LUTFrag from "../shaders/lut.frag";

var LUTShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "filterStrength": { type: 'f', value: 1.0 },
    "lookup": { type: 't', value: null },
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

    "	vUv = uv;",
    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: LUTFrag

};

export { LUTShader };
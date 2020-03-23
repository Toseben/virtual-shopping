#define LUT_FLIP_Y
#define saturate(a) clamp( a, 0.0, 1.0 )

uniform sampler2D tDiffuse;
uniform sampler2D lookup;
uniform float filterStrength;

#pragma glslify: colorTransform = require(glsl-lut)

varying vec2 vUv;

vec3 ACESFilmic( vec3 color ) {
  return saturate( ( color * ( 2.51 * color + 0.03 ) ) / ( color * ( 2.43 * color + 0.59 ) + 0.14 ) );
}

void main() {
  gl_FragColor = texture2D(tDiffuse, vUv) * 0.475;
  gl_FragColor.rgb = ACESFilmic( gl_FragColor.rgb );
  vec4 newColor = colorTransform(gl_FragColor, lookup);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, newColor.rgb, filterStrength);
}
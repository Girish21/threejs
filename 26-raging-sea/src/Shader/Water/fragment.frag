#define PI 3.1415926535897932384626433832795

uniform vec3 uWavesDepthColor;
uniform vec3 uWavesSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;

void main() {
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  vec3 color = mix(uWavesDepthColor, uWavesSurfaceColor, mixStrength);
  gl_FragColor = vec4(color, 1.);
}

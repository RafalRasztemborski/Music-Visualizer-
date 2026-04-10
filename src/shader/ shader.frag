precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;

  vec3 topColor = vec3(0.02, 0.04, 0.12);
  vec3 bottomColor = vec3(0.0, 0.0, 0.0);

  vec3 color = mix(topColor, bottomColor, st.y);

  float alpha = 0.1;

  gl_FragColor = vec4(color, alpha);
}
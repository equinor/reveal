precision highp float;

#pragma glslify: import('../math/derivateNormal.glsl')
#pragma glslify: import('../base/updateFragmentColor.glsl')
#pragma glslify: import('../base/nodeAppearance.glsl')
#pragma glslify: import('../base/determineNodeAppearance.glsl');
#pragma glslify: import('../base/determineColor.glsl');
#pragma glslify: import('../base/isClipped.glsl')

uniform sampler2D matCapTexture;
uniform lowp int renderMode;

in vec3 v_color;
in vec3 v_viewPosition;
in vec4 v_nodeAppearanceTexel;

flat in int v_treeIndex;

void main() {
  NodeAppearance appearance = nodeAppearanceFromTexel(v_nodeAppearanceTexel);
  if(isClipped(v_viewPosition)) {
    discard;
  }

  vec4 color = determineColor(v_color, appearance);
  vec3 normal = derivateNormal(v_viewPosition);
  updateFragmentColor(renderMode, color, v_treeIndex, normal, gl_FragCoord.z, matCapTexture, GeometryType.InstancedMesh);
}

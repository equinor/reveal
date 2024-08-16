#pragma glslify: import('../../base/determineMatrixOverride.glsl');
#pragma glslify: import('../../base/renderModes.glsl')
#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl')
#pragma glslify: import('../../base/determineVisibility.glsl')

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec2 treeIndexTextureSize;
uniform vec2 transformOverrideTextureSize;
uniform sampler2D transformOverrideIndexTexture;
uniform sampler2D transformOverrideTexture;
uniform sampler2D colorDataTexture;
uniform lowp int renderMode;

in vec3 position;
in mat4 a_instanceMatrix;
in float a_treeIndex;
in vec3 a_color;
in vec3 a_normal;

out vec2 v_xy;
out vec3 v_color;
out vec3 v_normal;
out vec3 vViewPosition;
out vec4 v_nodeAppearanceTexel;

flat out highp int v_treeIndex;

void main() {
  NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, a_treeIndex);
  if(!determineVisibility(appearance, renderMode)) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Will be clipped
    return;
  }

  v_nodeAppearanceTexel = appearance.colorTexel;
  v_treeIndex = int(a_treeIndex);
  v_xy = vec2(position.x, position.y);

  mat4 treeIndexWorldTransform = determineMatrixOverride(a_treeIndex, treeIndexTextureSize, transformOverrideIndexTexture, transformOverrideTextureSize, transformOverrideTexture);

  vec3 transformed = (a_instanceMatrix * vec4(position, 1.0)).xyz;
  vec4 mvPosition = modelViewMatrix * treeIndexWorldTransform * vec4(transformed, 1.0);
  v_color = a_color;

  v_normal = normalMatrix * normalize(treeIndexWorldTransform * vec4(normalize(a_normal), 0.0)).xyz;
  vViewPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}

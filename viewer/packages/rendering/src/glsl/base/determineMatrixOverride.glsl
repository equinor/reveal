mat4 determineMatrixOverride(
  int treeIndex,
  vec2 treeIndexTextureSize,
  sampler2D transformOverrideIndexTexture,
  vec2 transformOverrideTextureSize,
  sampler2D transformOverrideTexture
) {
    int dataTextureWidth = int(treeIndexTextureSize.x);
    int dataTextureHeight = int(treeIndexTextureSize.y);

    int xTreeIndexTextureCoord = treeIndex % dataTextureWidth;
    int yTreeIndexTextureCoord = treeIndex / dataTextureWidth;

    float index = texelFetch(transformOverrideIndexTexture, ivec2(xTreeIndexTextureCoord, yTreeIndexTextureCoord), 0).r;

    if(index == 0.0){
      return mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
    }

    index -= 1.0;

    float matrixElements[12];

    for(int i = 0; i < 12; i++){
      matrixElements[i] = texelFetch(transformOverrideTexture, ivec2(i + int(index) * 16, 0.0), 0).r;
    }

    return mat4(
      matrixElements[0], matrixElements[4], matrixElements[8],  0,
      matrixElements[1], matrixElements[5], matrixElements[9],  0,
      matrixElements[2], matrixElements[6], matrixElements[10], 0,
      matrixElements[3], matrixElements[7], matrixElements[11], 1
    );
}

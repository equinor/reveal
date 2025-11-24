bool determineVisibility(NodeAppearance nodeAppearance, int renderMode) {
  bool visible = nodeAppearance.isVisible;
  bool ghost = (renderMode == RenderTypeGhost) && nodeAppearance.renderGhosted;
  bool inFront = (renderMode == RenderTypeEffects) && nodeAppearance.renderInFront;
  bool back = (renderMode == RenderTypeColor) && !nodeAppearance.renderGhosted && !nodeAppearance.renderInFront;
   // override the fact that ghost style is not pickable (and thus does not render depth)
   // when: the node has ghost style AND color is white (1,1,1), then make it pickable
  bool ghostedButNotPickable = nodeAppearance.renderGhosted && !(dot(nodeAppearance.colorTexel.rgb, vec3(1.0, 1.0, 1.0)) == 3.0);
  bool other = (renderMode != RenderTypeColor && renderMode != RenderTypeEffects && renderMode != RenderTypeGhost) && !ghostedButNotPickable;
return visible && (ghost || inFront || back || other);
}

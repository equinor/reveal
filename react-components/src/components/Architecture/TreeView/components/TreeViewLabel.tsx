/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement } from 'react';
import { type TreeViewProps } from '../TreeViewProps';
import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';
import { LOADING_LABEL, MAX_LABEL_LENGTH } from '../utilities/constants';
import { Tooltip } from '@cognite/cogs.js';
import { TOOLTIP_DELAY } from '../../constants';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const TreeViewLabel = ({
  node,
  props
}: {
  node: ITreeNode;
  props: TreeViewProps;
}): ReactElement => {
  let label: string;
  let disabledTooltip = true;
  if (node.isLoadingChildren) {
    label = props.loadingLabel ?? LOADING_LABEL;
  } else {
    label = node.label;
    const maxLabelLength = props.maxLabelLength ?? MAX_LABEL_LENGTH;
    if (label.length > maxLabelLength) {
      label = label.substring(0, maxLabelLength) + '...';
      disabledTooltip = false;
    }
  }
  const Text = node.hasBoldLabel ? <b>{label}</b> : <span>{label}</span>;

  return (
    <Tooltip
      content={node.label}
      disabled={disabledTooltip}
      enterDelay={TOOLTIP_DELAY}
      placement={'right'}>
      {Text}
    </Tooltip>
  );
};

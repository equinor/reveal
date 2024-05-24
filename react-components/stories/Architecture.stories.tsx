/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  type QualitySettings,
  RevealToolbar,
  withSuppressRevealEvents,
  withCameraStateUrlParam,
  useGetCameraStateFromUrlParam,
  useCameraNavigation
} from '../src';
import { Color } from 'three';
import styled from 'styled-components';
import { Button, Menu, ToolBar } from '@cognite/cogs.js';
import { type ReactElement, useState, useEffect } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { RevealButtons } from '../src/components/Architecture/ToolButtons';
import { DomainObjectPanel } from '../src/components/Architecture/DomainObjectPanel';
import { ActiveToolToolbar } from '../src/components/Architecture/ActiveToolToolbar';

const meta = {
  title: 'Example/Architecture',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const MyCustomToolbar = styled(withSuppressRevealEvents(withCameraStateUrlParam(ToolBar)))`
  position: absolute;
  right: 20px;
  top: 70px;
`;

const exampleCustomSettingElements = (): ReactElement => {
  const [originalCadColor, setOriginalCadColor] = useState(false);

  return (
    <>
      <Menu.Item
        hasSwitch
        toggled={originalCadColor}
        onChange={() => {
          setOriginalCadColor((prevMode) => !prevMode);
        }}>
        Original CAD coloring
      </Menu.Item>
      <Button>Custom Button</Button>
    </>
  );
};

const exampleHighQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 95000000,
    highDetailProximityThreshold: 100
  },
  pointCloudBudget: {
    numberOfPoints: 12000000
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
    movingCameraResolutionFactor: 1
  }
};

const exampleLowQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 10_000_000,
    highDetailProximityThreshold: 100
  },
  pointCloudBudget: {
    numberOfPoints: 2_000_000
  },
  resolutionOptions: {
    maxRenderResolution: 1e5,
    movingCameraResolutionFactor: 1
  }
};

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }) => {
    return (
      <RevealStoryContainer
        color={new Color(0x4a4a4a)}
        viewerOptions={{ useFlexibleCameraManager: true }}>
        <FitToUrlCameraState />
        <CadModelContainer addModelOptions={addModelOptions} />
        <RevealToolbar
          customSettingsContent={exampleCustomSettingElements()}
          lowFidelitySettings={exampleLowQualitySettings}
          highFidelitySettings={exampleHighQualitySettings}
        />
        <MyCustomToolbar>
          <>
            <RevealButtons.SetFlexibleControlsTypeOrbit />
            <RevealButtons.SetFlexibleControlsTypeFirstPerson />
          </>
          <>
            <RevealButtons.FitView />
            <RevealButtons.SetAxisVisible />
          </>
          <>
            <RevealButtons.SetTerrainVisible />
            <RevealButtons.UpdateTerrain />
          </>
          <>
            <RevealButtons.Measurement />
          </>
        </MyCustomToolbar>

        <DomainObjectPanel />
        <ActiveToolToolbar />
      </RevealStoryContainer>
    );
  }
};

function FitToUrlCameraState(): ReactElement {
  const getCameraState = useGetCameraStateFromUrlParam();
  const cameraNavigation = useCameraNavigation();

  useEffect(() => {
    signalStoryReadyForScreenshot();
    const currentCameraState = getCameraState();
    if (currentCameraState === undefined) return;
    cameraNavigation.fitCameraToState(currentCameraState);
  }, []);

  return <></>;
}

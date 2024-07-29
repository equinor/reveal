/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Button,
  Dropdown,
  Menu,
  Tooltip as CogsTooltip,
  type IconType,
  Slider
} from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement,
  getIcon
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import styled from 'styled-components';
import { SettingsCommand } from '../../architecture/base/concreteCommands/SettingsCommand';
import { createButton } from './CommandButtons';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { OptionButton } from './OptionButton';
import { BaseSliderCommand } from '../../architecture/base/commands/BaseSliderCommand';

export const SettingsButton = ({
  inputCommand,
  isHorizontal = false
}: {
  inputCommand: SettingsCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseCommand>(() => getDefaultCommand(inputCommand, renderTarget), []);

  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconType | undefined>(undefined);

  const update = useCallback((command: BaseCommand) => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  }, []);

  useEffect(() => {
    update(command);
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command]);

  if (!(command instanceof SettingsCommand)) {
    return <></>;
  }
  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const label = command.getLabel(t);
  const shortcut = command.getShortCutKeys();
  const flexDirection = getFlexDirection(isHorizontal);
  const commands = command.commands;

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} shortcut={shortcut} />}
      disabled={label === undefined}
      appendTo={document.body}
      placement={placement}>
      <Dropdown
        visible={isOpen}
        hideOnSelect={false}
        appendTo={document.body}
        placement="auto-start"
        content={
          <StyledMenu
            style={{
              flexDirection
            }}>
            {commands.map((command, _index): ReactElement | undefined => {
              return createMenuItem(command, t);
            })}
          </StyledMenu>
        }>
        <Button
          type={getButtonType(command)}
          icon={icon}
          key={uniqueId}
          disabled={!isEnabled}
          toggled={isOpen}
          aria-label={label}
          iconPlacement="right"
          onClick={() => {
            setOpen((prevState) => !prevState);
          }}
        />
      </Dropdown>
    </CogsTooltip>
  );
};

export function createMenuItem(
  command: BaseCommand,
  t: TranslateDelegate
): ReactElement | undefined {
  if (command instanceof BaseSliderCommand) {
    return createSlider(command, t);
  }
  if (command instanceof BaseOptionCommand) {
    return createOptionButton(command, t);
  }
  if (command.isToggle) {
    return createToggle(command, t);
  }
  return createButton(command, false, true);
}

export function createToggle(command: BaseCommand, t: TranslateDelegate): ReactElement {
  const [isChecked, setChecked] = useState(command.isChecked);
  if (!command.isEnabled) {
    return <></>;
  }
  return (
    <Menu.Item
      key={command.uniqueId}
      hasSwitch={true}
      disabled={!command.isEnabled}
      toggled={isChecked}
      iconPlacement="right"
      style={{ padding: '4px 4px' }}
      onChange={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}>
      {command.getLabel(t)}
    </Menu.Item>
  );
}

export function createSlider(command: BaseSliderCommand, t: TranslateDelegate): ReactElement {
  const [value, setValue] = useState(command.value);

  if (!command.isEnabled) {
    return <></>;
  }
  return (
    <SliderDiv>
      key={command.uniqueId}
      <label>{command.getLabel(t)}</label>
      <StyledSlider
        min={command.min}
        max={command.max}
        step={command.step}
        onChange={(value: number) => {
          command.value = value;
          setValue(value);
        }}
        value={value}></StyledSlider>
    </SliderDiv>
  );
}

export function createOptionButton(command: BaseOptionCommand, t: TranslateDelegate): ReactElement {
  if (!command.isEnabled) {
    return <></>;
  }
  return (
    <OptionDiv>
      key={command.uniqueId}
      <label>{command.getLabel(t)}</label>
      <OptionButton inputCommand={command} isHorizontal={false} usedInSettings={true} />
    </OptionDiv>
  );
}

const StyledMenu = styled(Menu)`
  min-width: '0px',
  overflow: 'auto',
  padding: '4px 4px'
`;

const OptionDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 4px;
  font-size: 14px;
`;

const SliderDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 4px;
  font-size: 14px;
`;

const StyledSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
  width: 120px;
`;

/*!
 * Copyright 2024 Cognite AS
 */

import { BaseOptionCommand } from '../BaseOptionCommand';
import { RenderTargetCommand } from '../RenderTargetCommand';
import { type TranslateKey } from '../../utilities/TranslateKey';

enum MockEnum {
  Red = 'Red',
  Green = 'Green',
  Blue = 'Blue'
}

export class MockEnumOptionCommand extends BaseOptionCommand {
  public value = MockEnum.Red;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor() {
    super();
    for (const value of [MockEnum.Red, MockEnum.Green, MockEnum.Blue]) {
      this.add(new OptionItemCommand(this, value));
    }
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: 'Enum option' };
  }
}

// Note: This is not exported, as it is only used internally

class OptionItemCommand extends RenderTargetCommand {
  private readonly _value: MockEnum;
  private readonly _option: MockEnumOptionCommand;

  public constructor(option: MockEnumOptionCommand, value: MockEnum) {
    super();
    this._option = option;
    this._value = value;
  }

  public override get tooltip(): TranslateKey {
    return { fallback: this._value.toString() };
  }

  public override get isChecked(): boolean {
    return this._option.value === this._value;
  }

  public override invokeCore(): boolean {
    this._option.value = this._value;
    return true;
  }
}

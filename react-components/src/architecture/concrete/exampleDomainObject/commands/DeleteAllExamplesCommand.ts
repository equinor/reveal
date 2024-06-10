/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../../base/commands/RenderTargetCommand';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { ExampleDomainObject } from '../ExampleDomainObject';

export class DeleteAllExamplesCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'EXAMPLES_DELETE', fallback: 'Remove all examples' };
  }

  public override get icon(): string {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    const first = this.getFirst();
    return first !== undefined && first.canBeRemoved;
  }

  protected override invokeCore(): boolean {
    const array = Array.from(this.rootDomainObject.getDescendantsByType(ExampleDomainObject));
    array.reverse();
    for (const domainObject of array) {
      domainObject.removeInteractive();
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getFirst(): ExampleDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ExampleDomainObject);
  }
}

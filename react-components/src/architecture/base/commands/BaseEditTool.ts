/*!
 * Copyright 2024 Cognite AS
 */

import { NavigationTool } from './NavigationTool';
import { isDomainObjectIntersection } from '../domainObjectsHelpers/DomainObjectIntersection';
import { type BaseDragger } from '../domainObjectsHelpers/BaseDragger';
import { VisualDomainObject } from '../domainObjects/VisualDomainObject';
import { type AnyIntersection, CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

/**
 * The `BaseEditTool` class is an abstract class that extends the `NavigationTool` class.
 * It provides a base implementation for editing tools in a specific architecture.
 * Custom editing tools can be created by extending this class and overriding its methods.
 * This class will also provide the dragging functionality if the picked domain object has
 * createDragger() overridden.
 */
export abstract class BaseEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BaseDragger | undefined = undefined;

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override get defaultCursor(): string {
    return 'crosshair';
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._dragger = undefined;
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    this._dragger = await this.createDragger(event);
    if (this._dragger === undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    this._dragger.onPointerDown(event);
    this.deselectAll(this._dragger.domainObject);
    this._dragger.domainObject.setSelectedInteractive(true);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const ray = this.getRay(event, true);
    this._dragger.onPointerDrag(event, ray);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerUp(event, leftButton);
    } else {
      this._dragger.onPointerUp(event);
      this._dragger = undefined;
    }
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.deselectAll();
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Determines whether the specified domain object can be selected or dragged by this edit tool.
   * Override this function of the selection mechanism should be used.
   * @param domainObject - The domain object to be accepted.
   * @returns `true` if the domain object can be accepted, `false` otherwise.
   */
  protected canBeSelected(_domainObject: VisualDomainObject): boolean {
    return false;
  }

  /**
   * Override this function to create custom dragger
   * with other creation logic.
   */
  protected async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const domainObject = this.getIntersectedDomainObject(intersection);
    if (domainObject === undefined) {
      return undefined;
    }
    const ray = this.getRay(event);
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    const point = intersection.point.clone();
    point.applyMatrix4(matrix);
    ray.applyMatrix4(matrix);
    return domainObject.createDragger({ intersection, point, ray });
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  /**
   * Deselects all visual domain objects except for the specified object.
   * If no object is specified, all visual domain objects will be deselected.
   * @param except - The visual domain object to exclude from deselection.
   */
  protected deselectAll(except?: VisualDomainObject | undefined): void {
    const { rootDomainObject } = this;
    for (const domainObject of rootDomainObject.getDescendantsByType(VisualDomainObject)) {
      if (!this.canBeSelected(domainObject)) {
        continue;
      }
      if (except !== undefined && domainObject === except) {
        continue;
      }
      domainObject.setSelectedInteractive(false);
    }
  }

  /**
   * Retrieves all selected domain objects.
   * Use only if multi selection is expected.
   * @returns A generator that yields each selected domain object.
   */
  protected *getAllSelected(): Generator<VisualDomainObject> {
    const { rootDomainObject } = this;
    for (const domainObject of rootDomainObject.getDescendantsByType(VisualDomainObject)) {
      if (!domainObject.isSelected) {
        continue;
      }
      if (!this.canBeSelected(domainObject)) {
        continue;
      }
      yield domainObject;
    }
  }

  /**
   * Retrieves the selected VisualDomainObject.
   * Use only if single selection is expected.
   * @returns The selected DomainObject, or undefined if no object is selected.
   */
  protected getSelected(): VisualDomainObject | undefined {
    const { rootDomainObject } = this;
    for (const domainObject of rootDomainObject.getDescendantsByType(VisualDomainObject)) {
      if (!domainObject.isSelected) {
        continue;
      }
      if (!this.canBeSelected(domainObject)) {
        continue;
      }
      return domainObject;
    }
    return undefined;
  }

  /**
   * Retrieves the intersected visual domain object from the given intersection.
   * @param intersection - The intersection to retrieve the domain object from.
   * @returns The intersected visual domain object, or undefined if no valid domain object is found.
   */
  protected getIntersectedDomainObject(
    intersection: AnyIntersection | undefined
  ): VisualDomainObject | undefined {
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const { domainObject } = intersection;
    if (!(domainObject instanceof VisualDomainObject)) {
      return undefined;
    }
    if (!this.canBeSelected(domainObject)) {
      return undefined;
    }
    return domainObject;
  }
}

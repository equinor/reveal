/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CadNode } from './CadNode';
import { CadModelFactory } from './CadModelFactory';
import { CadModelMetadataRepository } from './CadModelMetadataRepository';
import { CadModelUpdateHandler } from './CadModelUpdateHandler';
import { discardSector } from './sector/sectorUtilities';
import { Subscription, Observable } from 'rxjs';

import { trackError } from '../../utilities/metrics';
import { SectorGeometry } from './sector/types';
import { SectorQuads } from './rendering/types';
import { MaterialManager } from './MaterialManager';
import { RenderMode } from './rendering/RenderMode';
import { LoadingState } from '../../utilities';
import { CadModelSectorBudget } from './CadModelSectorBudget';

export class CadManager<TModelIdentifier> {
  private readonly _materialManager: MaterialManager;
  private readonly _cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>;
  private readonly _cadModelFactory: CadModelFactory;
  private readonly _cadModelUpdateHandler: CadModelUpdateHandler;

  private readonly _cadModelMap: Map<string, CadNode> = new Map();
  private readonly _subscription: Subscription = new Subscription();

  private _needsRedraw: boolean = false;
  private readonly _markNeedsRedrawBound = this.markNeedsRedraw.bind(this);

  get materialManager() {
    return this._materialManager;
  }

  get budget(): CadModelSectorBudget {
    return this._cadModelUpdateHandler.budget;
  }

  set budget(budget: CadModelSectorBudget) {
    this._cadModelUpdateHandler.budget = budget;
  }

  constructor(
    materialManger: MaterialManager,
    cadModelMetadataRepository: CadModelMetadataRepository<TModelIdentifier>,
    cadModelFactory: CadModelFactory,
    cadModelUpdateHandler: CadModelUpdateHandler
  ) {
    this._materialManager = materialManger;
    this._cadModelMetadataRepository = cadModelMetadataRepository;
    this._cadModelFactory = cadModelFactory;
    this._cadModelUpdateHandler = cadModelUpdateHandler;
    this._subscription.add(
      this._cadModelUpdateHandler.consumedSectorObservable().subscribe(
        sector => {
          const cadModel = this._cadModelMap.get(sector.blobUrl);
          if (!cadModel) {
            // Model has been removed - results can come in for a period just after removal
            return;
          }
          if (cadModel.renderHints.showSectorBoundingBoxes) {
            cadModel!.updateSectorBoundingBox(sector);
          }
          const sectorNodeParent = cadModel.rootSector;
          const sectorNode = sectorNodeParent!.sectorNodeMap.get(sector.metadata.id);
          if (!sectorNode) {
            throw new Error(`Could not find 3D node for sector ${sector.metadata.id} - invalid id?`);
          }
          if (sectorNode.group) {
            sectorNode.group.userData.refCount -= 1;
            if (sectorNode.group.userData.refCount === 0) {
              discardSector(sectorNode.group);
            }
            sectorNode.remove(sectorNode.group);
          }
          if (sector.group) {
            // Is this correct now?
            sectorNode.add(sector.group);
          }
          sectorNode.group = sector.group;
          this.markNeedsRedraw();
        },
        error => {
          trackError(error, {
            moduleName: 'CadManager',
            methodName: 'constructor'
          });
        }
      )
    );
  }

  dispose() {
    this._cadModelUpdateHandler.dispose();
    this._subscription.unsubscribe();
  }

  requestRedraw(): void {
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  updateCamera(camera: THREE.PerspectiveCamera) {
    this._cadModelUpdateHandler.updateCamera(camera);
    this._needsRedraw = true;
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._materialManager.clippingPlanes;
  }

  set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
    this._cadModelUpdateHandler.clippingPlanes = clippingPlanes;
    this._needsRedraw = true;
  }

  get clipIntersection(): boolean {
    return this._materialManager.clipIntersection;
  }

  set clipIntersection(clipIntersection: boolean) {
    this._materialManager.clipIntersection = clipIntersection;
    this._cadModelUpdateHandler.clipIntersection = clipIntersection;
    this._needsRedraw = true;
  }

  get renderMode(): RenderMode {
    return this._materialManager.getRenderMode();
  }

  set renderMode(renderMode: RenderMode) {
    this._materialManager.setRenderMode(renderMode);
  }

  async addModel(modelIdentifier: TModelIdentifier): Promise<CadNode> {
    const metadata = await this._cadModelMetadataRepository.loadData(modelIdentifier);
    if (this._cadModelMap.has(metadata.blobUrl)) {
      throw new Error(`Model ${modelIdentifier} has already been added`);
    }

    const model = this._cadModelFactory.createModel(metadata);
    model.addEventListener('update', this._markNeedsRedrawBound);
    this._cadModelMap.set(metadata.blobUrl, model);
    this._cadModelUpdateHandler.addModel(model);
    return model;
  }

  removeModel(model: CadNode): void {
    const metadata = model.cadModelMetadata;
    if (!this._cadModelMap.delete(metadata.blobUrl)) {
      throw new Error(`Could not remove model ${metadata.blobUrl} because it's not added`);
    }
    model.removeEventListener('update', this._markNeedsRedrawBound);
    this._cadModelUpdateHandler.removeModel(model);
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._cadModelUpdateHandler.getLoadingStateObserver();
  }

  getParsedData(): Observable<{ blobUrl: string; lod: string; data: SectorGeometry | SectorQuads }> {
    return this._cadModelUpdateHandler.getParsedData();
  }

  private markNeedsRedraw(): void {
    this._needsRedraw = true;
  }
}

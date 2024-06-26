/*!
 * Copyright 2021 Cognite AS
 */
import { IndexSet } from '@reveal/utilities';
import { AreaCollection } from './prioritized/AreaCollection';
import { NodeCollection } from './NodeCollection';
import { SerializedNodeCollection } from './SerializedNodeCollection';

/**
 * Node collection that combines the result from multiple underlying node collections.
 */
export abstract class CombineNodeCollectionBase extends NodeCollection {
  private readonly _changedUnderlyingNodeCollectionHandler: () => void;
  private _cachedCombinedIndexSet: IndexSet | undefined = undefined;
  protected _nodeCollections: NodeCollection[] = [];

  constructor(classToken: string, nodeCollections?: NodeCollection[]) {
    super(classToken);

    this._changedUnderlyingNodeCollectionHandler = this.makeDirty.bind(this);
    if (nodeCollections) {
      nodeCollections.forEach(x => this.add(x));
    }
  }

  add(nodeCollection: NodeCollection): void {
    nodeCollection.on('changed', this._changedUnderlyingNodeCollectionHandler);
    this._nodeCollections.push(nodeCollection);
    this.makeDirty();
  }

  remove(nodeCollection: NodeCollection): void {
    const index = this._nodeCollections.indexOf(nodeCollection);
    if (index < 0) {
      throw new Error('Could not find set');
    }

    nodeCollection.off('changed', this._changedUnderlyingNodeCollectionHandler);
    this._nodeCollections.splice(index, 1);
    this.makeDirty();
  }

  /**
   * Clears all underlying node collections.
   */
  clear(): void {
    throw new Error(`${this.classToken} does not support clear()`);
  }

  protected makeDirty(): void {
    if (this._cachedCombinedIndexSet === undefined) return;
    this._cachedCombinedIndexSet = undefined;
    this.notifyChanged();
  }

  /**
   * @override
   */
  getIndexSet(): IndexSet {
    this._cachedCombinedIndexSet = this._cachedCombinedIndexSet ?? this.createCombinedIndexSet();
    return this._cachedCombinedIndexSet;
  }

  /**
   * @override
   */
  get isLoading(): boolean {
    return this._nodeCollections.some(x => x.isLoading);
  }

  public abstract serialize(): SerializedNodeCollection;

  public abstract getAreas(): AreaCollection;

  protected abstract createCombinedIndexSet(): IndexSet;
}

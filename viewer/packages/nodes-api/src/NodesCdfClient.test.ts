/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';
import { CogniteInternalId, CogniteClient } from '@cognite/sdk';
import { NodesCdfClient } from './NodesCdfClient';

function stubTreeIndexToNodeId(treeIndex: number): CogniteInternalId {
  return treeIndex + 1337;
}

function stubNodeIdToTreeIndex(nodeId: CogniteInternalId): number {
  return nodeId - 1337;
}

type ByTreeIndicesRequestBody = {
  items: CogniteInternalId[];
};

type ByNodeIdsRequestBody = {
  items: number[];
};

describe('NodesCdfClient', () => {
  let bytreeindicesRequestCount: number;
  let byinternalidsRequestCount: number;
  let nodesClient: NodesCdfClient;

  beforeEach(() => {
    bytreeindicesRequestCount = 0;
    byinternalidsRequestCount = 0;
    nock.disableNetConnect();
    nock(/.*/)
      .persist()
      .post(/.*\/internalids\/bytreeindices/)
      .reply(200, (_uri, requestBody: ByTreeIndicesRequestBody) => {
        bytreeindicesRequestCount++;
        return { items: requestBody.items.map(stubTreeIndexToNodeId) };
      });
    nock(/.*/)
      .persist()
      .post(/.*\/treeindices\/byinternalids/)
      .reply(200, (_uri, requestBody: ByNodeIdsRequestBody) => {
        byinternalidsRequestCount++;
        return { items: requestBody.items.map(stubNodeIdToTreeIndex) };
      });

    const client = new CogniteClient({ appId: 'reveal.test', project: 'dummy', getToken: async () => 'dummy' });

    nodesClient = new NodesCdfClient(client);
  });

  afterEach(() => {
    nock.recorder.clear();
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('mapTreeIndicesToNodeIds with a single item', async () => {
    const nodeIds = await nodesClient.mapTreeIndicesToNodeIds(0, 0, [10]);
    expect(nodeIds).toEqual([10].map(stubTreeIndexToNodeId));
    expect(bytreeindicesRequestCount).toEqual(1); // One request
  });

  test('mapTreeIndicesToNodeIds with a a lot of items, splits into batches', async () => {
    await nodesClient.mapTreeIndicesToNodeIds(0, 0, Array.from(new Array(1111).keys()));
    expect(bytreeindicesRequestCount).toEqual(2); // Two requests
  });

  test('mapNodeIdsToTreeIndices with a single item', async () => {
    const nodeIds = await nodesClient.mapNodeIdsToTreeIndices(0, 0, [10]);

    expect(nodeIds).toEqual([10].map(stubNodeIdToTreeIndex));
    expect(byinternalidsRequestCount).toEqual(1); // One request
  });

  test('mapNodeIdsToTreeIndices with a a lot of items, splits into batches', async () => {
    await nodesClient.mapNodeIdsToTreeIndices(0, 0, Array.from(new Array(1111).keys()));
    expect(byinternalidsRequestCount).toEqual(2); // Two requests
  });
});

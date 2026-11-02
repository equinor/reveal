/*!
 * Copyright 2026 Cognite AS
 */
import { BufferGeometry, InstancedInterleavedBuffer, InterleavedBufferAttribute } from 'three';
import { splitTorusCollectionByArcAngle } from './splitTorusCollection';
import { setTorusGeometry, TORUS_ARC_SEGMENTS, TORUS_LARGE_ARC_SEGMENTS } from './primitiveGeometries';

describe(splitTorusCollectionByArcAngle.name, () => {
  const deg = (degrees: number) => (degrees * Math.PI) / 180;
  const treeIndices = (geometry: BufferGeometry) => {
    const attribute = geometry.getAttribute('a_treeIndex') as InterleavedBufferAttribute;
    return Array.from({ length: attribute.count }, (_, i) => attribute.getX(i));
  };
  const indexCount = (arcSegments: number) => arcSegments * 9 * 6;

  test('keeps a collection without large arcs as is', () => {
    const geometry = createTorusCollection([deg(90), deg(45)]);

    const parts = splitTorusCollectionByArcAngle(geometry);

    expect(parts).toEqual([{ geometry, arcSegments: TORUS_ARC_SEGMENTS }]);
  });

  test('uses the large arc grid on a collection with only large arcs, without copying', () => {
    const geometry = createTorusCollection([deg(180), deg(135)]);

    const parts = splitTorusCollectionByArcAngle(geometry);

    expect(parts).toHaveLength(1);
    expect(parts[0].geometry).toBe(geometry);
    expect(parts[0].arcSegments).toBe(TORUS_LARGE_ARC_SEGMENTS);
    expect(geometry.getIndex()!.count).toBe(indexCount(TORUS_LARGE_ARC_SEGMENTS));
  });

  test('splits a mixed collection and preserves instance data', () => {
    const geometry = createTorusCollection([deg(90), deg(180), deg(99), deg(101)]);

    const [regular, largeArc] = splitTorusCollectionByArcAngle(geometry);

    expect(regular.arcSegments).toBe(TORUS_ARC_SEGMENTS);
    expect(treeIndices(regular.geometry)).toEqual([0, 2]);
    expect(regular.geometry.getIndex()!.count).toBe(indexCount(TORUS_ARC_SEGMENTS));

    expect(largeArc.arcSegments).toBe(TORUS_LARGE_ARC_SEGMENTS);
    expect(treeIndices(largeArc.geometry)).toEqual([1, 3]);
    expect(largeArc.geometry.getIndex()!.count).toBe(indexCount(TORUS_LARGE_ARC_SEGMENTS));

    const arcAngle = largeArc.geometry.getAttribute('a_arcAngle') as InterleavedBufferAttribute;
    expect(arcAngle.getX(0)).toBeCloseTo(deg(180));
    const color = largeArc.geometry.getAttribute('a_color') as InterleavedBufferAttribute;
    expect(color.normalized).toBe(true);
    expect(color.getX(1)).toBeCloseTo(3 / 255);
  });
});

/**
 * Same interleaved layout as the GLB parser: treeIndex, color (4 × uint8), arcAngle, radius, tubeRadius.
 * Tree index and the first color component are set to the instance index.
 */
function createTorusCollection(arcAngles: number[]): BufferGeometry {
  const floatStride = 5;
  const floats = new Float32Array(arcAngles.length * floatStride);
  const bytes = new Uint8Array(floats.buffer);
  arcAngles.forEach((arcAngle, i) => {
    floats[i * floatStride] = i;
    bytes[(i * floatStride + 1) * 4] = i;
    floats[i * floatStride + 2] = arcAngle;
    floats[i * floatStride + 3] = 1;
    floats[i * floatStride + 4] = 0.1;
  });
  const floatBuffer = new InstancedInterleavedBuffer(floats, floatStride);
  const byteBuffer = new InstancedInterleavedBuffer(bytes, floatStride * 4);

  const geometry = new BufferGeometry();
  setTorusGeometry(geometry);
  geometry.setAttribute('a_treeIndex', new InterleavedBufferAttribute(floatBuffer, 1, 0));
  geometry.setAttribute('a_color', new InterleavedBufferAttribute(byteBuffer, 4, 4, true));
  geometry.setAttribute('a_arcAngle', new InterleavedBufferAttribute(floatBuffer, 1, 2));
  geometry.setAttribute('a_radius', new InterleavedBufferAttribute(floatBuffer, 1, 3));
  geometry.setAttribute('a_tubeRadius', new InterleavedBufferAttribute(floatBuffer, 1, 4));
  return geometry;
}

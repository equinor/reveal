/*!
 * Copyright 2026 Cognite AS
 */

import type { TypedArray } from '@reveal/utilities';
import { BufferGeometry, InstancedInterleavedBuffer, InterleavedBufferAttribute } from 'three';
import {
  setTorusGeometry,
  TORUS_ARC_SEGMENTS,
  TORUS_LARGE_ARC_ANGLE,
  TORUS_LARGE_ARC_SEGMENTS
} from './primitiveGeometries';

export type TorusSegmentGeometry = {
  geometry: BufferGeometry;
  arcSegments: number;
};

/**
 * Splits a torus segment collection into regular and large arc torus segments, each with its own grid
 * (see {@link setTorusGeometry}), so the regular ones can use fewer arc segments.
 *
 * Performance: instance data is only copied when a collection has both kinds, which is a single pass over
 * the sector's torus segments when it is loaded. At render time each kind is batched separately, which adds
 * one draw call per batch buffer.
 */
export function splitTorusCollectionByArcAngle(geometry: BufferGeometry): TorusSegmentGeometry[] {
  const attributes = Object.entries(geometry.attributes).filter(
    (entry): entry is [string, InterleavedBufferAttribute] => entry[1] instanceof InterleavedBufferAttribute
  );
  const arcAngle = geometry.getAttribute('a_arcAngle') as InterleavedBufferAttribute | undefined;
  if (arcAngle === undefined || attributes.length === 0) {
    return [{ geometry, arcSegments: TORUS_ARC_SEGMENTS }];
  }

  const isLargeArc = Array.from({ length: arcAngle.count }, (_, i) => arcAngle.getX(i) > TORUS_LARGE_ARC_ANGLE);
  const largeArcCount = isLargeArc.filter(Boolean).length;
  if (largeArcCount === 0) {
    return [{ geometry, arcSegments: TORUS_ARC_SEGMENTS }];
  }
  if (largeArcCount === arcAngle.count) {
    setTorusGeometry(geometry, TORUS_LARGE_ARC_SEGMENTS);
    return [{ geometry, arcSegments: TORUS_LARGE_ARC_SEGMENTS }];
  }

  const sourceArray = arcAngle.array as TypedArray;
  const instanceByteSize = arcAngle.data.stride * sourceArray.BYTES_PER_ELEMENT;
  const sourceBytes = new Uint8Array(sourceArray.buffer, sourceArray.byteOffset, arcAngle.count * instanceByteSize);

  const createPart = (largeArc: boolean, count: number): TorusSegmentGeometry => {
    const bytes = new Uint8Array(count * instanceByteSize);
    let target = 0;
    isLargeArc.forEach((large, i) => {
      if (large === largeArc) {
        bytes.set(sourceBytes.subarray(i * instanceByteSize, (i + 1) * instanceByteSize), target);
        target += instanceByteSize;
      }
    });

    const part = new BufferGeometry();
    const arcSegments = largeArc ? TORUS_LARGE_ARC_SEGMENTS : TORUS_ARC_SEGMENTS;
    setTorusGeometry(part, arcSegments);
    // Attributes of the same component type share one interleaved buffer, like in the parsed geometry
    const buffers = new Map<number, InstancedInterleavedBuffer>();
    attributes.forEach(([name, attribute]) => {
      const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;
      let buffer = buffers.get(componentSize);
      if (buffer === undefined) {
        const view = componentSize === 1 ? bytes : new Float32Array(bytes.buffer);
        buffer = new InstancedInterleavedBuffer(view, attribute.data.stride);
        buffers.set(componentSize, buffer);
      }
      part.setAttribute(
        name,
        new InterleavedBufferAttribute(buffer, attribute.itemSize, attribute.offset, attribute.normalized)
      );
    });
    return { geometry: part, arcSegments };
  };

  return [createPart(false, arcAngle.count - largeArcCount), createPart(true, largeArcCount)];
}

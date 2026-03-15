export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type ProjectedPoint = {
  x: number;
  y: number;
  scale: number;
};

export type Face = {
  indices: [number, number, number];
};

export type Mesh = {
  name: string;
  vertices: Vector3[];
  faces: Face[];
};

function triangulate(indices: number[]) {
  const faces: Array<[number, number, number]> = [];

  for (let index = 1; index < indices.length - 1; index += 1) {
    faces.push([indices[0], indices[index], indices[index + 1]]);
  }

  return faces;
}

function lengthOf(vector: Vector3) {
  return Math.sqrt(
    vector.x * vector.x + vector.y * vector.y + vector.z * vector.z,
  );
}

export function subtractVector(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

export function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function dotProduct(a: Vector3, b: Vector3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function normalizeVector(vector: Vector3): Vector3 {
  const length = lengthOf(vector);

  if (!length) {
    return {x: 0, y: 0, z: 0};
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

export function faceCentroid(vertices: Vector3[]) {
  const total = vertices.reduce(
    (accumulator, vertex) => ({
      x: accumulator.x + vertex.x,
      y: accumulator.y + vertex.y,
      z: accumulator.z + vertex.z,
    }),
    {x: 0, y: 0, z: 0},
  );

  return {
    x: total.x / vertices.length,
    y: total.y / vertices.length,
    z: total.z / vertices.length,
  };
}

export function triangleArea(points: ProjectedPoint[]) {
  const [a, b, c] = points;

  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function rotateVector(point: Vector3, rotation: Vector3): Vector3 {
  const sinX = Math.sin(rotation.x);
  const cosX = Math.cos(rotation.x);
  const sinY = Math.sin(rotation.y);
  const cosY = Math.cos(rotation.y);
  const sinZ = Math.sin(rotation.z);
  const cosZ = Math.cos(rotation.z);

  const x1 = point.x;
  const y1 = point.y * cosX - point.z * sinX;
  const z1 = point.y * sinX + point.z * cosX;

  const x2 = x1 * cosY + z1 * sinY;
  const y2 = y1;
  const z2 = -x1 * sinY + z1 * cosY;

  return {
    x: x2 * cosZ - y2 * sinZ,
    y: x2 * sinZ + y2 * cosZ,
    z: z2,
  };
}

export function projectVector(
  point: Vector3,
  width: number,
  height: number,
  zoom = 240,
  cameraDistance = 6,
): ProjectedPoint {
  const depth = Math.max(0.8, cameraDistance - point.z);
  const scale = zoom / depth;

  return {
    x: width / 2 + point.x * scale,
    y: height / 2 - point.y * scale,
    scale,
  };
}

export function parseObjMesh(source: string, name: string): Mesh {
  const vertices: Vector3[] = [];
  const faces: Face[] = [];

  source.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    if (trimmed.startsWith('v ')) {
      const [, x, y, z] = trimmed.split(/\s+/);
      vertices.push({
        x: Number(x),
        y: Number(y),
        z: Number(z),
      });
      return;
    }

    if (trimmed.startsWith('f ')) {
      const indices = trimmed
        .split(/\s+/)
        .slice(1)
        .map(part => Number(part.split('/')[0]) - 1)
        .filter(index => Number.isFinite(index) && index >= 0);

      triangulate(indices).forEach(face => {
        faces.push({indices: face});
      });
    }
  });

  return {name, vertices, faces};
}

export function createSphereMesh(
  name: string,
  latitudeSegments = 10,
  longitudeSegments = 14,
  radius = 1.35,
): Mesh {
  const vertices: Vector3[] = [];
  const faces: Face[] = [];

  for (let lat = 0; lat <= latitudeSegments; lat += 1) {
    const theta = (lat / latitudeSegments) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longitudeSegments; lon += 1) {
      const phi = (lon / longitudeSegments) * Math.PI * 2;
      vertices.push({
        x: radius * Math.cos(phi) * sinTheta,
        y: radius * cosTheta,
        z: radius * Math.sin(phi) * sinTheta,
      });
    }
  }

  for (let lat = 0; lat < latitudeSegments; lat += 1) {
    for (let lon = 0; lon < longitudeSegments; lon += 1) {
      const stride = longitudeSegments + 1;
      const a = lat * stride + lon;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;

      faces.push({indices: [a, b, d]});
      faces.push({indices: [b, c, d]});
    }
  }

  return {name, vertices, faces};
}

export function createSurfaceMesh(
  name: string,
  rows = 11,
  columns = 11,
  size = 3,
): Mesh {
  const vertices: Vector3[] = [];
  const faces: Face[] = [];

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const x = ((column / columns) - 0.5) * size;
      const z = ((row / rows) - 0.5) * size;
      vertices.push({x, y: 0, z});
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const stride = columns + 1;
      const a = row * stride + column;
      const b = a + stride;
      const c = b + 1;
      const d = a + 1;

      faces.push({indices: [a, b, d]});
      faces.push({indices: [b, c, d]});
    }
  }

  return {name, vertices, faces};
}

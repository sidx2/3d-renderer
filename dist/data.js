const verts = [
    [-5, -5, -20],
    [5, 5, -10],
    [-5, 5, -10],
    [5, -5, -10]
];
const cubeVerts = [
    [-5, 5, 5],
    [5, 5, 5],
    [5, -5, 5],
    [-5, -5, 5],
    [-5, 5, -5],
    [5, 5, -5],
    [5, -5, -5],
    [-5, -5, -5],
];
const floorVerts = [
    [-5, 0, -5],
    [5, 0, -5],
    [5, 0, 5],
    [-5, 0, 5],
];
const floorFaces = [
    { indices: [3, 1, 0], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [3, 2, 1], textureCoords: [[0, 1], [1, 1], [1, 0]] },
];
const cubeFaces = [
    // front face
    { indices: [3, 1, 0], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [3, 2, 1], textureCoords: [[0, 1], [1, 1], [1, 0]] },
    // left face
    { indices: [7, 0, 4], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [7, 3, 0], textureCoords: [[0, 1], [1, 1], [1, 0]] },
    // right face
    { indices: [2, 5, 1], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [2, 6, 5], textureCoords: [[0, 1], [1, 1], [1, 0]] },
    // bottom face
    { indices: [7, 2, 3], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [7, 6, 2], textureCoords: [[0, 1], [1, 1], [1, 0]] },
    // top face
    { indices: [0, 5, 4], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [0, 1, 5], textureCoords: [[0, 1], [1, 1], [1, 0]] },
    // back face
    { indices: [4, 6, 7], textureCoords: [[0, 1], [1, 0], [0, 0]] },
    { indices: [4, 5, 6], textureCoords: [[0, 1], [1, 1], [1, 0]] },
];
const faces = [
    { indices: [0, 1, 2], textures: [[0, 1], [1, 0], [0, 0]] },
    { indices: [0, 3, 1], textures: [[0, 1], [1, 1], [1, 0]] }
];

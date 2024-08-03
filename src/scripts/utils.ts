const sub = (a: number[], b: number[]): number[] => {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

const cross = (a: number[], b: number[]): number[] => {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ]
}

const dot = (a: number[], b: number[]): number => {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

}

const len = (v: number[]): number => {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

const normalize = (v: number[]): number[] => {
    const l = len(v);
    return [
        v[0] / l,
        v[1] / l,
        v[2] / l,
    ]
}

const edgeFunction = (a: number[], b: number[], c: number[]): number => {
    return (c[0] - a[0]) * (b[1] - a[1])
        - (c[1] - a[1]) * (b[0] - a[0]);
}

const getRotationMat = (angle: number, axis: "x" | "y" | "z"): number[][] => {
    switch (axis.toLowerCase()) {
        case "x": {
            return [
                [1, 0, 0],
                [0, Math.cos(angle), -Math.sin(angle)],
                [0, Math.sin(angle), Math.cos(angle)],
            ]
            break;
        }
        case "y": {
            return [
                [Math.cos(angle), 0, -Math.sin(angle)],
                [0, 1, 0],
                [Math.sin(angle), 0, Math.cos(angle)],
            ]
            break;
        }
        case "z": {
            return [
                [Math.cos(angle), -Math.sin(angle), 0],
                [Math.sin(angle), Math.cos(angle), 0],
                [0, 0, 1],
            ]
            break;
        }
        default: {
            console.warn(`Cannot rotate around ${axis} axis`);
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ];
            break;
        }
    }
}

const rotateVertices = (vertices: number[][], rotMat: number[][]): number[][] => {
    const rotated: number[][] = [];
    for (const v of vertices) {
        const x = v[0] * rotMat[0][0] + v[1] * rotMat[0][1] + v[2] * rotMat[0][2];
        const y = v[0] * rotMat[1][0] + v[1] * rotMat[1][1] + v[2] * rotMat[1][2];
        const z = v[0] * rotMat[2][0] + v[1] * rotMat[2][1] + v[2] * rotMat[2][2];

        rotated.push([x, y, z]);
    }
    return rotated;
}

const rotatePoint = (point: number[], rotMat: number[][]): number[] => {
    const x = point[0] * rotMat[0][0] + point[1] * rotMat[0][1] + point[2] * rotMat[0][2];
    const y = point[0] * rotMat[1][0] + point[1] * rotMat[1][1] + point[2] * rotMat[1][2];
    const z = point[0] * rotMat[2][0] + point[1] * rotMat[2][1] + point[2] * rotMat[2][2];

    return [x, y, z];
}

const transform = (vertices: number[][], t: number[]): number[][] => {
    const transformed: number[][] = [];
    for (const v of vertices) {
        transformed.push([
            v[0] + t[0],
            v[1] + t[1],
            v[2] + t[2]
        ]);
    }
    return transformed;

}

const getImageCoordinatesOfTriangle = (t: number[][], w: number, h: number): number[][] => {
    let imgCoordinates = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let i = 0;
    for (const v of t) {

        const screenX = v[0] / -v[2];
        const screenY = v[1] / -v[2] * (w / h);

        const ndcX = (screenX + 1) / 2;
        const ndcY = (screenY + 1) / 2;

        const imgX = ndcX * w;
        const imgY = (1 - ndcY) * h;

        imgCoordinates[i++] = [imgX, imgY, v[2]];
    }

    return imgCoordinates;

}

const getImageCoordinatesOfVertices = (vs: number[][], w: number, h: number): number[][] => {
    let imgCoordinates: number[][] = [];
    for (const v of vs) {

        const screenX = v[0] / -v[2];
        const screenY = v[1] / -v[2] * (w / h);

        const ndcX = (screenX + 1) / 2;
        const ndcY = (screenY + 1) / 2;

        const imgX = ndcX * w;
        const imgY = (1 - ndcY) * h;

        imgCoordinates.push([imgX, imgY, v[2]]);
    }

    return imgCoordinates;

}

const getBoundingBox = (t: number[][]): [number, number, number, number] => {
    let xmin = Infinity, xmax = -Infinity;
    let ymin = Infinity, ymax = -Infinity;

    for (const v of t) {
        xmin = Math.min(xmin, v[0]);
        ymin = Math.min(ymin, v[1]);

        xmax = Math.max(xmax, v[0]);
        ymax = Math.max(ymax, v[1]);
    }

    return [xmin, xmax, ymin, ymax];
}

const matrixMultiply = (matrixA: number[][], matrixB: number[][]): number[][] => {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    if (colsA !== rowsB) {
        throw new Error("Matrix dimensions are not compatible for multiplication.");
    }

    const result = new Array(rowsA);
    for (let i = 0; i < rowsA; i++) {
        result[i] = new Array(colsB);
        for (let j = 0; j < colsB; j++) {
            result[i][j] = 0;
            for (let k = 0; k < colsA; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }

    return result;
}

const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, color = "red"): void => {
    const tmpFillStyle = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 5, 5);
    ctx.fillStyle = tmpFillStyle;
}

const isPointInsideTriangle = (t: number[][], p: number[]): number[] | null => {
    // console.log(t);

    const e0 = sub(t[1], t[0]);
    const e1 = sub(t[2], t[1]);
    const e2 = sub(t[0], t[2]);

    const e0p = sub(p, t[0]);
    const e1p = sub(p, t[1]);
    const e2p = sub(p, t[2]);

    const c0 = (cross(e0, e0p));
    const c1 = (cross(e1, e1p));
    const c2 = (cross(e2, e2p));

    const area = len(cross(e0, sub(t[2], t[0])));

    // console.log("dots: ");
    // console.log(dot(normalize(c0), [0,0,-1]));
    // console.log(dot(normalize(c1), [0,0,-1]));
    // console.log(dot(normalize(c2), [0,0,-1])); 
    const bary = [len(c0) / area, len(c1) / area, len(c2) / area]

    const invV0z = 1 / t[0][2];
    const invV1z = 1 / t[1][2];
    const invV2z = 1 / t[2][2];

    const invZ = 1 / (invV0z * bary[0] + invV1z * bary[1] + invV2z * bary[2]);
    const justz = t[0][2] * bary[0] +
        t[1][2] * bary[1] +
        t[2][2] * bary[2];

    if (dot(normalize(c0), [0, 0, -1]) >= 0 &&
        dot(normalize(c1), [0, 0, -1]) >= 0 &&
        dot(normalize(c2), [0, 0, -1]) >= 0)
        return [...bary, justz];

    else return null;

}

const getBarycentricCoordinates = (t: number[][], p: number[]): number[] | null => {
    const w0 = edgeFunction(t[1], t[2], p);
    const w1 = edgeFunction(t[2], t[0], p);
    const w2 = edgeFunction(t[0], t[1], p);

    const area = edgeFunction(t[0], t[1], t[2]);

    if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
        return [
            w0 / area,
            w1 / area,
            w2 / area,
        ];
    }

    return null;
}

const getHomogeniusCoordinates = (verts: number[][]): number[][] => {
    const h: number[][] = [];
    for (const v of verts) {
        h.push([...v, 1]);
    }
    return h;
}

const getLookAtMat = (from: number[], to: number[], arbitraryUp: number[]) => {
    let forward = sub(from, to);
    forward = normalize(forward);

    let right = cross(arbitraryUp, forward);
    right = normalize(right);

    let up = cross(forward, right);

    let m: number[][] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

    m[0][0] = right[0], m[0][1] = right[1], m[0][2] = right[2];
    m[1][0] = up[0], m[1][1] = up[1], m[1][2] = up[2];
    m[2][0] = forward[0], m[2][1] = forward[1], m[2][2] = forward[2];
    m[3][0] = from[0], m[3][1] = from[1], m[3][2] = from[2];

    return m;
}

const readFile = async (path: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(img, 0, 0);
            resolve(canvas);
        };
        img.onerror = reject;
        img.src = path;
    });
}

function getPixelColor(canvas: HTMLCanvasElement, i: number, j: number): [number, number, number] {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const imageData = ctx.getImageData(i, j, 1, 1).data;
    const [r, g, b] = imageData;
    return [r, g, b];
}

class Obj3d {
    verts: number[][];
    faces: { indices: number[], textureCoords: number[][] }[];
    texture: HTMLCanvasElement;

    tranlation: number[]; // [x, y, z]
    rotation: number[]; // [x, y, z]

    constructor(
        verts: number[][], 
        faces: { indices: number[], textureCoords: number[][] }[], 
        texture: HTMLCanvasElement
    ) {
        this.verts = verts;
        this.faces = faces;
        this.texture = texture;
    }


}
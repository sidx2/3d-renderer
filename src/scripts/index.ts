(async () => {

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    if (!canvas) {
        throw "canvas not found";
    }

    const SCREEN_FACTOR = 10;

    canvas.width = 16 * SCREEN_FACTOR;
    canvas.height = 9 * SCREEN_FACTOR;

    const aspectRatio = 16 / 9;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw "2d ctx not supported";
    }

    const crateTextureCanvas: HTMLCanvasElement = await readFile("src/assets/crate-texture.jpg");
    const stoneFloorTextureCanvas: HTMLCanvasElement = await readFile("src/assets/stone-floor-texture.jpg");


    const cube3d = new Obj3d(cubeVerts, cubeFaces, crateTextureCanvas);
    const floor3d = new Obj3d(floorVerts, floorFaces, stoneFloorTextureCanvas);

    cube3d.tranlation = [0, 0, -20];
    const objects3d: Obj3d[] = [];

    for (let x = -40; x < 40; x += 5) {
        for (let z = -40; z < 40; z += 5) {
            const f = new Obj3d(floorVerts, floorFaces, stoneFloorTextureCanvas);
            f.tranlation = [x, -5, z];
            objects3d.push(f);
        }
    }

    for (let i = 0; i < 10; i++) {
        const cube3d = new Obj3d(cubeVerts, cubeFaces, crateTextureCanvas);
        cube3d.tranlation = [Math.random() * 40, 0, Math.random() * 40];
        objects3d.push(cube3d);
    }

    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
    }

    let mouseMoved = false;
    let deltaX = 0;
    let deltaY = 0;

    let angle = 1;

    const from = [0, 0, 0];
    let to = [-0.7, 0, 0.7];
    let toPitch = [0, 0, -1];
    const arbitraryUp = [0, 1, 0];

    let camera = [-20, 0, -20];

    let previousTime = 0;

    const loop = (currentTime: number): void => {
        const deltaTime = (currentTime - previousTime) / 1000;
        previousTime = currentTime;

        const data = new Uint8ClampedArray(canvas.width * canvas.height * 4).fill(24);
        for (let i = 3; i < data.length; i += 4) {
            data[i] = 255; // Set alpha to fully opaque
        }

        const zbuf: number[] = new Array(canvas.width * canvas.height).fill(-100);

        for (const obj3d of objects3d) {
            for (let f of obj3d.faces) {
                let t = [obj3d.verts[f.indices[0]], obj3d.verts[f.indices[1]], obj3d.verts[f.indices[2]],];

                t = transform(t, obj3d.tranlation);

                t = transform(t, [-camera[0], -camera[1], -camera[2]]);
                t = matrixMultiply(getHomogeniusCoordinates(t), getLookAtMat(from, to, arbitraryUp));
                t = matrixMultiply(t, getLookAtMat(from, toPitch, arbitraryUp));

                const imgt = getImageCoordinatesOfTriangle(t, canvas.width, canvas.height);
                if (imgt[0][2] > -0.1 || imgt[1][2] > -0.1 || imgt[2][2] > -0.1) continue;

                const [xmin, xmax, ymin, ymax] = getBoundingBox(imgt);
                if (xmin > canvas.width || xmax < 0 || ymin > canvas.height || ymax < 0) continue;


                for (let i = Math.round(xmin); i <= Math.round(xmax); i++) {
                    for (let j = Math.round(ymin); j < Math.round(ymax); j++) {
                        if (i <= 0 || i >= canvas.width || j <= 0 || j >= canvas.height) continue;
                        if (imgt[0][2] > -1.1 || imgt[1][2] > -1.1 || imgt[2][2] > -1.1) continue;
                        const bary = getBarycentricCoordinates(imgt, [i + 0.5, j + 0.5, 0]);
                        if (bary) {
                            const z = 1 / (
                                (1 / (imgt[0][2]) * bary[0]) +
                                (1 / (imgt[1][2]) * bary[1]) +
                                (1 / (imgt[2][2]) * bary[2])
                            );


                            if (z > zbuf[j * canvas.width + i]) {
                                zbuf[j * canvas.width + i] = z;

                                let texx =
                                    (f.textureCoords[0][0] / imgt[0][2]) * bary[0] +
                                    (f.textureCoords[1][0] / imgt[1][2]) * bary[1] +
                                    (f.textureCoords[2][0] / imgt[2][2]) * bary[2];


                                let texy =
                                    (f.textureCoords[0][1] / imgt[0][2]) * bary[0] +
                                    (f.textureCoords[1][1] / imgt[1][2]) * bary[1] +
                                    (f.textureCoords[2][1] / imgt[2][2]) * bary[2];

                                const pixelColor = getPixelColor(obj3d.texture, texx * obj3d.texture.width * z, texy * obj3d.texture.height * z);

                                const index = (j * canvas.width + i) * 4;

                                data[index + 0] = pixelColor[0];
                                data[index + 1] = pixelColor[1];
                                data[index + 2] = pixelColor[2];
                                data[index + 3] = 255;
                            }
                        }
                    }
                }

            }
        }

        const imageData: ImageData = new ImageData(data, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        angle += 0.04;
        update(deltaTime);
        window.requestAnimationFrame(loop);
    }

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "w": keys.w = true; break;
            case "a": keys.a = true; break;
            case "s": keys.s = true; break;
            case "d": keys.d = true; break;

            case "ArrowUp": keys.w = true; break;
            case "ArrowLeft": keys.a = true; break;
            case "ArrowDown": keys.s = true; break;
            case "ArrowRight": keys.d = true; break;
        }
    });

    document.addEventListener("keyup", (e) => {
        switch (e.key) {
            case "w": keys.w = false; break;
            case "a": keys.a = false; break;
            case "s": keys.s = false; break;
            case "d": keys.d = false; break;

            case "ArrowUp": keys.w = false; break;
            case "ArrowLeft": keys.a = false; break;
            case "ArrowDown": keys.s = false; break;
            case "ArrowRight": keys.d = false; break;
        }
    });

    const mouseMovement = (e: MouseEvent) => {
        deltaX = e.movementX;
        deltaY = e.movementY;
        mouseMoved = true;
    }

    const update = (deltaTime: number) => {
        handleKeyboardEvents(deltaTime);
        handleMouseEvents();
    }

    const handleMouseEvents = () => {
        if (deltaX !== 0 || deltaY !== 0) {
            to = rotatePoint(to, getRotationMat(-deltaX * 0.002, "y"));
            toPitch = rotatePoint(toPitch, getRotationMat(deltaY * 0.002, "x"));
            deltaX = 0;
            deltaY = 0;
        }
    };

    document.addEventListener("pointerlockchange", () => {
        if (document.pointerLockElement === canvas) {
            document.addEventListener("mousemove", mouseMovement);
        } else {
            document.removeEventListener("mousemove", mouseMovement);
            toPitch[1] = 0;
        }
    })

    document.addEventListener("click", (e) => {
        canvas.requestPointerLock();
    })

    const handleKeyboardEvents = (dt: number) => {
        const MOVEMENT_SPEED = 15;
        const ROTATION_SPEED = 10;
        if (keys.a) {
            to = rotatePoint(to, getRotationMat(0.1 * ROTATION_SPEED * dt, "y"));
        }
        if (keys.d) {
            to = rotatePoint(to, getRotationMat(-0.1 * ROTATION_SPEED * dt, "y"));
        }

        if (keys.w) {
            camera[0] -= to[0] * MOVEMENT_SPEED * dt;
            // camera[1] += to[1] * MOVEMENT_SPEED * dt;
            camera[2] += to[2] * MOVEMENT_SPEED * dt;

        }
        if (keys.s) {
            camera[0] += to[0] * MOVEMENT_SPEED * dt;
            // camera[1] -= to[1] * MOVEMENT_SPEED * dt;
            camera[2] -= to[2] * MOVEMENT_SPEED * dt;
        }
    }

    window.requestAnimationFrame(loop);
})();
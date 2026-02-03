import * as math from 'mathjs';
import * as THREE from 'three';

export const generateKnotPoints = (
    xEq: string,
    yEq: string,
    zEq: string,
    segments = 100,
    tMax = Math.PI * 2
): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];

    let xNode: math.EvalFunction;
    let yNode: math.EvalFunction;
    let zNode: math.EvalFunction;

    try {
        xNode = math.compile(xEq);
        yNode = math.compile(yEq);
        zNode = math.compile(zEq);
    } catch (e) {
        console.error('Error compiling equations:', e);
        return []; // Return empty if parsing fails
    }

    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * tMax;
        const scope = { t: t, PI: Math.PI };

        try {
            const x = xNode.evaluate(scope);
            const y = yNode.evaluate(scope);
            const z = zNode.evaluate(scope);
            points.push(new THREE.Vector3(x, y, z));
        } catch (e) {
            // console.error("Error evaluating equations at t=" + t, e);
        }
    }

    return points;
};

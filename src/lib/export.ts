import type * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export async function exportKnot(mesh: THREE.Mesh, format: 'obj' | 'stl' = 'obj', name: string = 'knot') {
    if (!mesh) return;

    let result: string | ArrayBuffer | DataView | null = null;
    let extension = '';
    let mimeType = '';

    if (format === 'obj') {
        const exporter = new OBJExporter();
        result = exporter.parse(mesh);
        extension = 'obj';
        mimeType = 'text/plain';
    } else if (format === 'stl') {
        const exporter = new STLExporter();
        result = exporter.parse(mesh, { binary: true });
        extension = 'stl';
        mimeType = 'application/octet-stream';
    }

    if (result) {
        const blob = new Blob([result], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

export type KnotPreset = {
    name: string;
    x: string;
    y: string;
    z: string;
    defaultColor?: string;
};

export const PRESETS: Record<string, KnotPreset> = {
    trefoil: {
        name: 'Trefoil',
        x: 'sin(t) + 2 * sin(2*t)',
        y: 'cos(t) - 2 * cos(2*t)',
        z: '-sin(3*t)',
        defaultColor: '#00ff88'
    },
    figure8: {
        name: 'Figure 8',
        x: 'cos(t)',
        y: 'sin(t) * cos(t)',
        z: 'sin(t)',
        defaultColor: '#ff0088'
    },
    torus: {
        name: 'Torus Knot (3,2)',
        x: '(2 + cos(3*t)) * cos(2*t)',
        y: '(2 + cos(3*t)) * sin(2*t)',
        z: 'sin(3*t)',
        defaultColor: '#0088ff'
    },
    cinquefoil: {
        name: 'Cinquefoil (5,2)',
        x: '(2 + cos(5*t)) * cos(2*t)',
        y: '(2 + cos(5*t)) * sin(2*t)',
        z: 'sin(5*t)',
        defaultColor: '#ffaa00'
    },
    lissajous: {
        name: 'Lissajous (3,4,5)',
        x: 'sin(3*t)',
        y: 'sin(4*t)',
        z: 'sin(5*t)',
        defaultColor: '#aa00ff'
    },
    granny: {
        name: 'Granny Knot',
        x: '-2.2 * cos(t) - 1.2 * cos(3*t)',
        y: '-2.2 * sin(t) - 1.2 * sin(3*t)',
        z: 'sin(2*t)',
        defaultColor: '#ff8888'
    },
    square: {
        name: 'Square Knot',
        x: 'sin(t) + 2*sin(2*t)',
        y: 'cos(t) - 2*cos(2*t)',
        // Approximation or composite required for true square knot, using visual proxy
        z: '-sin(5*t) * 0.5',
        defaultColor: '#8888ff'
    },
    stevedore: {
        name: 'Stevedore (6_1)',
        x: '(2 + cos(2*t)) * cos(3*t)',
        y: '(2 + cos(2*t)) * sin(3*t)',
        z: 'sin(4*t)', // Simplified representation
        defaultColor: '#ffff00'
    },
    carrick: {
        name: 'Carrick Bend',
        x: 'cos(2*t) * (cos(7*t) + 0.5)',
        y: 'sin(2*t) * (cos(7*t) + 0.5)',
        z: 'sin(7*t) * 0.5',
        defaultColor: '#00ffff'
    },
    unknot: {
        name: 'Unknot (Circle)',
        x: 'cos(t)',
        y: 'sin(t)',
        z: '0',
        defaultColor: '#ffffff'
    },
    twist: {
        name: 'Twist Knot',
        x: 'cos(2*t + 1)',
        y: 'sin(2*t + 1)',
        z: 'cos(3*t) + sin(5*t)',
        defaultColor: '#ff00ff'
    },
    prime7_1: {
        name: '7_1 Knot',
        x: '(2.5 + cos(7*t)) * cos(2*t)',
        y: '(2.5 + cos(7*t)) * sin(2*t)',
        z: 'sin(7*t)',
        defaultColor: '#88ff00'
    },
    decoration: {
        name: 'Decorative',
        x: 'sin(5*t)*cos(2*t)',
        y: 'sin(5*t)*sin(2*t)',
        z: 'cos(5*t)',
        defaultColor: '#ff4444'
    },
    harmonograph: {
        name: 'Harmonograph 3D',
        x: 'sin(2*t) + sin(3*t)',
        y: 'cos(2*t) + cos(3*t)',
        z: 'sin(4*t)',
        defaultColor: '#4444ff'
    },
    eight_eightteen: {
        name: '8_18 Knot',
        x: 'cos(t) * (2 + cos(3*t))',
        y: 'sin(t) * (2 + cos(3*t))',
        z: 'sin(2*t) + sin(4*t + 1.5)', // Artistic approx
        defaultColor: '#ffcc00'
    },
    pretzel: {
        name: 'Pretzel Link',
        x: 'cos(3*t)',
        y: 'sin(2*t)',
        z: 'cos(5*t)',
        defaultColor: '#ccff00'
    },
    coil: {
        name: 'Coil / Spring',
        x: 'cos(5*t)',
        y: 'sin(5*t)',
        z: 't / 5', // Note: range handling needs to support this
        defaultColor: '#00ccff'
    },
    infinity: {
        name: 'Infinity Symbol',
        x: 'cos(t)',
        y: 'sin(2*t) / 2',
        z: 'sin(t) * 0.2',
        defaultColor: '#ff88cc'
    },
    helix_torus: {
        name: 'Helix on Torus',
        x: '(4 + sin(20*t)) * cos(t)',
        y: '(4 + sin(20*t)) * sin(t)',
        z: 'cos(20*t)',
        defaultColor: '#aa44aa'
    },
    random_mess: {
        name: 'Complex Tangle',
        x: 'sin(t) + cos(2.3*t)',
        y: 'cos(t) - sin(2.3*t)',
        z: 'sin(3.5*t)',
        defaultColor: '#888888'
    }
};

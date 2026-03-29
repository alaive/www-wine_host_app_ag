import { useRef, useMemo } from 'react';
import { useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { useTexture, Box, Plane, Cylinder, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- GLSL SHADER CODE ---

const FireShaderMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color(0.2, 0.1, 0.05),
        seed: 0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying float vElevation;
    uniform float time;
    uniform float seed;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Slight "wind" or flicker movement
      float flicker = sin(time * 5.0 + seed) * 0.05 * pos.y;
      pos.x += flicker;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    // Fragment Shader
    `
    varying vec2 vUv;
    uniform float time;
    uniform vec3 color;
    uniform float seed;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Shape mask: tapered at top, wide at bottom
      float left = smoothstep(0.0, 0.4, uv.x);
      float right = smoothstep(1.0, 0.6, uv.x);
      float bottom = smoothstep(0.0, 0.2, uv.y);
      float top = smoothstep(1.0, 0.1, uv.y); // Fade out at very top
      float shape = left * right * bottom * top;

      // Noise animation- scroll noise downwards
      float noiseVal = snoise(vec2(uv.x * 2.0 + seed, uv.y * 1.5 - time * 2.5));
      float noiseVal2 = snoise(vec2(uv.x * 5.0 - time, uv.y * 4.0 - time * 4.0));
      
      float combinedNoise = (noiseVal + noiseVal2 * 0.5);

      // Gradient Logic
      float intensity = 1.0 - uv.y; 
      intensity += combinedNoise * 0.5;
      
      float alpha = smoothstep(0.3, 0.6, intensity) * shape;

      // Color Ramp
      vec3 black = vec3(0.0);
      vec3 darkRed = vec3(0.4, 0.0, 0.0);
      vec3 orange = vec3(1.0, 0.3, 0.0);
      vec3 yellow = vec3(1.0, 0.8, 0.2);
      vec3 white = vec3(1.0, 1.0, 1.0);

      vec3 finalColor = black;
      if (intensity > 0.1) finalColor = mix(black, darkRed, smoothstep(0.1, 0.3, intensity));
      if (intensity > 0.3) finalColor = mix(finalColor, orange, smoothstep(0.3, 0.5, intensity));
      if (intensity > 0.6) finalColor = mix(finalColor, yellow, smoothstep(0.6, 0.8, intensity));
      if (intensity > 0.85) finalColor = mix(finalColor, white, smoothstep(0.85, 1.0, intensity));

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

extend({ FireShaderMaterial });

// Add types for the custom shader material
declare global {
    namespace JSX {
        interface IntrinsicElements {
            fireShaderMaterial: ReactThreeFiber.ThreeElement<typeof FireShaderMaterial>;
        }
    }
}

export const Fireplace = ({ position = [0, 0, 0] as [number, number, number] }) => {
    const lightRef = useRef<THREE.PointLight>(null);
    const sparksRef = useRef<THREE.Points>(null);
    const fireMeshes = useRef<(THREE.Mesh | null)[]>([]);

    const { brick } = useTexture({
        brick: './images/textures/brick_diffuse.png',
    });

    const sparkCount = 20; // Reduced from 40
    const sparkPositions = useMemo(() => {
        const pos = new Float32Array(sparkCount * 3);
        for (let i = 0; i < sparkCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 1.2;
            pos[i * 3 + 1] = Math.random() * 2.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
        }
        return pos;
    }, []);

    const sparkSpeeds = useMemo(() => {
        return new Float32Array(sparkCount).map(() => 0.01 + Math.random() * 0.04);
    }, []);

    // Optimization: Track frames to throttle heavy updates
    const frameCount = useRef(0);

    useFrame((state) => {
        frameCount.current++;
        const time = state.clock.getElapsedTime();

        // Animate Fire Shaders
        if (fireMeshes.current) {
            fireMeshes.current.forEach((mesh, i) => {
                if (mesh && mesh.material && 'uniforms' in mesh.material) {
                    (mesh.material as THREE.ShaderMaterial).uniforms.time.value = time + i * 10;
                }
            });
        }

        // Intense flickering light - smoothed out to reduce shadow map update stress
        if (lightRef.current) {
            // Slower flicker with less amplitude to save GPU
            const flicker = Math.sin(time * 8) * 1.5;
            lightRef.current.intensity = 15 + flicker;
            // Only move light every few frames to reduce matrix updates
            if (frameCount.current % 4 === 0) {
                lightRef.current.position.x = Math.sin(time * 0.5) * 0.05;
            }
        }

        // Animate sparks - Throttled to every 2nd frame to save CPU
        if (sparksRef.current && frameCount.current % 2 === 0) {
            const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < sparkCount; i++) {
                positions[i * 3 + 1] += sparkSpeeds[i] * 2; // Compensate for speed

                if (positions[i * 3 + 1] > 3.0) {
                    positions[i * 3 + 1] = 0.1;
                    positions[i * 3] = (Math.random() - 0.5) * 1.2;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
                }

                positions[i * 3] += Math.sin(time * 1.5 + i) * 0.006;
            }
            sparksRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group position={position}>
            {/* RUSTIC CHIMNEY STRUCTURE */}
            <group position={[0, 0, 0]}>
                <Box args={[4, 8, 1.2]} position={[0, 4, -0.6]}>
                    <meshStandardMaterial map={brick} color="#554433" roughness={0.9} />
                </Box>
                <Box args={[4.2, 0.3, 2]} position={[0, 0.15, 0.4]}>
                    <meshStandardMaterial color="#333333" roughness={0.8} />
                </Box>
                <Box args={[3.2, 0.4, 0.6]} position={[0, 2.5, 0.1]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={1} />
                </Box>
                <Box args={[2.8, 2.5, 1]} position={[0, 1.25, -0.1]}>
                    <meshStandardMaterial color="#1a1008" side={THREE.BackSide} />
                </Box>
            </group>

            {/* 3D Wood Logs */}
            <group position={[0, 0.4, 0]}>
                <Cylinder args={[0.12, 0.14, 1.6, 8]} rotation={[0, 0.1, Math.PI / 2]} position={[0, 0.12, 0]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={1} />
                </Cylinder>
                <Cylinder args={[0.11, 0.13, 1.5, 8]} rotation={[0, -0.2, Math.PI / 2]} position={[0.2, 0.12, 0.3]}>
                    <meshStandardMaterial color="#4a3525" roughness={1} />
                </Cylinder>
                <Cylinder args={[0.1, 0.12, 1.4, 8]} rotation={[0.4, 0.6, Math.PI / 2]} position={[-0.3, 0.35, 0.1]}>
                    <meshStandardMaterial color="#2d1e16" roughness={1} />
                </Cylinder>
                <Cylinder args={[0.09, 0.11, 1.3, 8]} rotation={[-0.3, -0.5, Math.PI / 2]} position={[0.3, 0.38, 0.1]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={1} />
                </Cylinder>
            </group>

            {/* GLSL Fire System */}
            <group position={[0, 0.6, 0.2]}>
                <Plane args={[1.8, 2.5]} position={[0, 0.8, 0]}>
                    {/* @ts-ignore */}
                    <fireShaderMaterial
                        ref={(el: THREE.Mesh) => fireMeshes.current[0] = el}
                        transparent
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        seed={0.1}
                    />
                </Plane>
                <Plane args={[1.8, 2.5]} position={[0, 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
                    {/* @ts-ignore */}
                    <fireShaderMaterial
                        ref={(el: THREE.Mesh) => fireMeshes.current[1] = el}
                        transparent
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        seed={0.2}
                    />
                </Plane>
                <Plane args={[1.5, 2.0]} position={[0, 0.7, 0.1]}>
                    {/* @ts-ignore */}
                    <fireShaderMaterial
                        ref={(el: THREE.Mesh) => fireMeshes.current[2] = el}
                        transparent
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        seed={0.5}
                    />
                </Plane>
            </group>

            {/* Sparks */}
            <points ref={sparksRef} position={[0, 0.5, 0]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[sparkPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.04} color="#ffaa33" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            {/* Dynamic Lighting - Reduced intensity and bias adjustment for performance */}
            <pointLight
                ref={lightRef}
                position={[0, 1.5, 1.5]}
                color="#ff5500"
                intensity={15}
                distance={15}
                decay={2}
                castShadow
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.001}
            />
            <pointLight
                position={[0, 0.8, 0]}
                color="#ffaa00"
                intensity={5}
                distance={4}
                decay={1}
            />
        </group>
    );
};

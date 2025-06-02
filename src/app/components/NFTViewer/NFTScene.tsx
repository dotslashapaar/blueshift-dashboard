"use client";

import React, { Suspense, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { courseColors } from "@/app/utils/course";
import { Text } from "@react-three/drei";
import { useWindowSize } from "usehooks-ts";

// Custom gradient material for backdrop
const BackdropMaterial = shaderMaterial(
  {},
  // Vertex shader
  `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    varying vec2 vUv;
    
    void main() {
      // Linear gradient from #0B0E14 (top) to black (bottom)
      vec3 topColor = vec3(0.0431, 0.0549, 0.0784); // #0B0E14
      vec3 bottomColor = vec3(0.0, 0.0, 0.0); // black
      
      vec3 color = mix(bottomColor, topColor, vUv.y);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ BackdropMaterial });

// Custom shader material that combines all effects
const NFTMaterial = shaderMaterial(
  {
    // Uniforms
    matcap1: null,
    matcap3: null,
    time: 0,
    gradientColor: new THREE.Vector3(0.0, 1.0, 1.0),
  },
  // Vertex shader
  `
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    
    void main() {
      vLocalPosition = position;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      
      vec4 viewPosition = viewMatrix * worldPosition;
      vViewPosition = -viewPosition.xyz;
      
      vNormal = normalize(normalMatrix * normal);
      vViewNormal = normalize((viewMatrix * modelMatrix * vec4(normal, 0.0)).xyz);
      
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  // Fragment shader
  `
    uniform sampler2D matcap1;
    uniform sampler2D matcap3;
    uniform float time;
    uniform vec3 gradientColor;
    
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    varying vec3 vViewNormal;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    
    vec2 getMatcapUV(vec3 viewNormal) {
      // Standard Three.js matcap UV calculation
      vec3 n = normalize(viewNormal);
      
      // This is the proven approach used in Three.js MeshMatcapMaterial
      vec3 viewPos = normalize(vViewPosition);
      vec3 x = normalize(vec3(viewPos.z, 0.0, -viewPos.x));
      vec3 y = cross(viewPos, x);
      vec2 uv = vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
      
      return uv;
    }
    
    // Rotate UV coordinates by angle in radians
    vec2 rotateUV(vec2 uv, float angle) {
      float cos_angle = cos(angle);
      float sin_angle = sin(angle);
      
      // Center UV at origin
      uv -= 0.5;
      
      // Apply rotation matrix
      vec2 rotated = vec2(
        uv.x * cos_angle - uv.y * sin_angle,
        uv.x * sin_angle + uv.y * cos_angle
      );
      
      // Return to 0-1 range
      return rotated + 0.5;
    }
    
    // Top to bottom gradient based on local Y position (unaffected by rotation)
    float getTopToBottomGradient() {
      // Use local position Y to get true top-to-bottom gradient
      float normalizedY = (vLocalPosition.y + 4.25) / 8.5; // Card height is 8.5, centered at 0
      return smoothstep(0.0, 1.0, normalizedY);
    }
    
    // Enhanced fresnel effect for edge lighting - using world space for consistency
    float getFresnel() {
      // Calculate camera position in world space
      vec3 cameraWorldPos = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      
      // Calculate view direction from surface to camera in world space
      vec3 viewDirection = normalize(cameraWorldPos - vWorldPosition);
      
      // Use the world normal for consistent fresnel regardless of rotation
      vec3 worldNormal = normalize(vWorldNormal);
      
      // Calculate fresnel using world space vectors
      float fresnel = 1.0 - abs(dot(viewDirection, worldNormal));
      return pow(fresnel, 4.2); // Slightly reduced power for more consistent edge lighting
    }
    
    void main() {
      vec2 matcapUV = getMatcapUV(normalize(vViewNormal));
      
      // Sample matcap textures with rotations
      vec3 matcap1Color = texture2D(matcap1, rotateUV(matcapUV, 4.1)).rgb;
      vec3 matcap3Color = texture2D(matcap3, rotateUV(matcapUV, 0.1)).rgb; // 180 degrees
      
      // Top to bottom gradient using course color
      float gradientMask = getTopToBottomGradient();
      vec3 gradientColorFinal = gradientColor * gradientMask;
      
      // Start with base color
      vec3 finalColor = vec3(0.0);
      
      // Add matcap1 with additive blending (shiny base)
      finalColor += matcap1Color;
      
      // Add matcap3 with multiply blending (enhanced rainbow effect)
      finalColor *= mix(vec3(1.0), matcap3Color, 1.0); // Increased from 0.4 to 0.7
      
      finalColor += gradientColorFinal * 0.08;
      
      // Apply consistent fresnel edge lighting while preserving iridescence
      float fresnel = getFresnel();
      // Reduce the silver intensity and apply it additively to preserve underlying colors
      finalColor += vec3(1.0, 1.0, 1.0) * fresnel * 0.8; // Reduced from 0.9 to 0.5 to preserve iridescence
      
      // Enhance overall brightness slightly
      finalColor *= 1.0;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend the material so we can use it as JSX
extend({ NFTMaterial });

// Enhanced mesh component that updates lighting uniforms
function NFTMesh({
  geometry,
  challengeLanguage,
  challengeDifficulty,
}: {
  geometry: THREE.ExtrudeGeometry;
  challengeLanguage: string;
  challengeDifficulty: number;
}) {
  const materialRef = useRef<any>(null);

  // Load matcap textures
  const [matcap1, matcap3] = useTexture([
    "/textures/new.webp",
    "/textures/3.webp",
  ]);

  // Calculate gradient color from course colors
  const gradientColor = useMemo(() => {
    const colorString =
      courseColors[challengeLanguage as keyof typeof courseColors] ||
      courseColors.Typescript;
    const [r, g, b] = colorString.split(",").map(Number);
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  }, [challengeLanguage]);

  return (
    <mesh position={[0, 0, 0]} geometry={geometry}>
      {React.createElement("nFTMaterial", {
        ref: materialRef,
        matcap1: matcap1,
        matcap3: matcap3,
        gradientColor: gradientColor,
      })}
    </mesh>
  );
}

// SVG Icon component using texture-based approach
function SVGImage({
  src,
  position = [0, 0, 0],
  scale = [1, 1, 1],
}: {
  src: string;
  position?: [number, number, number];
  scale?: [number, number, number];
}) {
  const texture = useTexture(src);

  // Configure texture for crisp rendering
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        alphaTest={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Scene component that contains the 3D content
function Scene({
  challengeName,
  challengeLanguage,
  challengeDifficulty,
}: {
  challengeName: string;
  challengeLanguage: string;
  challengeDifficulty: number;
}) {
  const orbitControlsRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const light = useRef<any>(null);
  // Animation state for the entire group
  const [isInteracting, setIsInteracting] = useState(false);
  const animationStateRef = useRef({
    time: 0,
    isAnimating: true,
    lastInteractionTime: 0,
    resumeDelay: 0, // 500ms delay before resuming
  });

  // Handle OrbitControls interaction events
  const handleControlsStart = useCallback(() => {
    setIsInteracting(true);
    animationStateRef.current.isAnimating = false;
  }, []);

  const handleControlsEnd = useCallback(() => {
    setIsInteracting(false);
    animationStateRef.current.lastInteractionTime = Date.now();
  }, []);

  // EaseInOut function for smooth damping effect
  const easeInOut = useCallback((t: number) => {
    return Math.sin(t * Math.PI);
  }, []);

  // Animation loop for the entire group
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentTime = Date.now();
    const timeSinceLastInteraction =
      currentTime - animationStateRef.current.lastInteractionTime;

    // Resume animation after delay if not interacting
    if (
      !isInteracting &&
      !animationStateRef.current.isAnimating &&
      timeSinceLastInteraction > animationStateRef.current.resumeDelay
    ) {
      animationStateRef.current.isAnimating = true;
    }

    // Only animate if animation is enabled
    if (animationStateRef.current.isAnimating) {
      // Update animation time
      animationStateRef.current.time += delta * 0.3; // Slow down the animation speed

      // Create oscillating value between -1 and 1
      const oscillation = Math.sin(animationStateRef.current.time);

      // Apply strong easeInOut for damping effect
      const easedValue =
        easeInOut(Math.abs(oscillation)) * Math.sign(oscillation);

      // Convert to rotation angle (±10 degrees in radians)
      const rotationAngle = (easedValue * 10 * Math.PI) / 180;

      // Apply rotation to the entire group (keeping base rotation + animation)
      meshRef.current.rotation.y = Math.PI / 6 + rotationAngle;
    }
  });

  // Create the beveled rectangle geometry
  const beveledRectGeometry = useMemo(() => {
    // Create a rounded rectangle shape
    const shape = new THREE.Shape();
    const width = 7.5;
    const height = 8.5;
    const radius = 0.32;

    // Start from bottom-left, going clockwise
    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(
      width / 2,
      -height / 2,
      width / 2,
      -height / 2 + radius
    );
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(
      width / 2,
      height / 2,
      width / 2 - radius,
      height / 2
    );
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(
      -width / 2,
      height / 2,
      -width / 2,
      height / 2 - radius
    );
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(
      -width / 2,
      -height / 2,
      -width / 2 + radius,
      -height / 2
    );

    // Extrude settings for proper beveling
    const extrudeSettings = {
      depth: 0.24, // 24 points of extrusion
      bevelEnabled: true,
      bevelThickness: 0.09, // 5 bevel thickness
      bevelSize: 0.09, // 5 bevel size
      bevelSegments: 5, // Increased from 2 to 3 for smoother bevels
      curveSegments: 48, // Increased from 30 to 32 for even smoother curves
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Ensure normals are computed properly for all surfaces
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  return (
    <>
      {/* Backdrop with gradient */}
      <mesh position={[0, 0, -8]} scale={[25, 25, 1]}>
        <planeGeometry args={[1, 1]} />
        {React.createElement("backdropMaterial")}
      </mesh>

      {/* Enhanced mesh with lighting integration and animation */}
      <group
        ref={meshRef}
        rotation={[0, Math.PI / 6, Math.PI / 72]} // Base rotation applied to the entire group
      >
        <NFTMesh
          challengeDifficulty={challengeDifficulty}
          geometry={beveledRectGeometry}
          challengeLanguage={challengeLanguage}
        />

        {/* SVG Icons using texture on planes - more reliable approach */}
        <SVGImage
          src={`/textures/language-${challengeLanguage.toLowerCase()}.svg`}
          position={[0, 0, 0.37]}
          scale={[7.5, 8.5, 2]}
        />

        <SVGImage
          src={`/textures/difficulty-${challengeDifficulty}.svg`}
          position={[0, 0, 0.36]}
          scale={[7.5, 8.5, 1]}
        />

        <SVGImage
          src="/textures/qualified-text.svg"
          position={[0, 0, 0.36]}
          scale={[7.5, 8.5, 1]}
        />

        <Text
          position={[-3.15, 0.28, 0.38]}
          color="white"
          fontSize={0.68}
          lineHeight={1.1}
          font="/fonts/FunnelDisplay-Medium.ttf"
          anchorX="left"
          anchorY="top-baseline"
          maxWidth={6}
        >
          {challengeName}
        </Text>
      </group>

      {/* <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.005}
        enablePan={false}
        enableZoom={false}
        minAzimuthAngle={-Math.PI / 30}
        maxAzimuthAngle={Math.PI / 30}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        onStart={handleControlsStart}
        onEnd={handleControlsEnd}
      /> */}
    </>
  );
}

// Main NFT Scene React component
export default function NFTScene({
  challengeName,
  challengeLanguage,
  challengeDifficulty,
  isAnimationComplete = false,
}: {
  challengeName: string;
  challengeLanguage: string;
  challengeDifficulty: number;
  isAnimationComplete: boolean;
}) {
  const { width } = useWindowSize();

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-[#0D0E14] to-black">
      {isAnimationComplete && (
        <Canvas
          dpr={[1.5, 2]}
          shadows
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.NoToneMapping,
          }}
          orthographic
          camera={{
            position: [0, 0, 7.5],
            rotation: [0, 0, 0],
            zoom: width < 768 ? 40 : 45,
          }}
        >
          <Suspense fallback={null}>
            <Scene
              challengeName={challengeName}
              challengeLanguage={challengeLanguage}
              challengeDifficulty={challengeDifficulty}
            />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

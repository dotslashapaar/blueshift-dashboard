"use client";

import React, { Suspense, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { courseColors } from "@/app/utils/course";
import { Text } from "@react-three/drei";
import { useWindowSize } from "usehooks-ts";

// Custom shader material that combines all effects
const NFTMaterial = shaderMaterial(
  {
    // Uniforms
    matcap1: null,
    matcap3: null,
    time: 0,
    gradientColor: new THREE.Vector3(0.0, 1.0, 1.0),
    referenceCameraZ: 7.5,
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
    uniform float referenceCameraZ;
    
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
    
    // Helper for random number generation (white noise)
    // Used for dithering to break up gradient banding
    float random(vec2 p) {
      // Uses gl_FragCoord.xy which provides screen-space pixel coordinates
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Top to bottom gradient based on local Y position (unaffected by rotation)
    float getTopToBottomGradient() {
      // Use local position Y to get true top-to-bottom gradient
      // Card height is 10.0, ranging from -5.0 to +5.0
      float normalizedY = (vLocalPosition.y + 5.0) / 10.0;
      
      // Clamp to ensure we stay within bounds
      normalizedY = clamp(normalizedY, 0.0, 1.0);

      // Add a small amount of dither to break up banding artifacts.
      float ditherStrength = 0.05;
      normalizedY += (random(gl_FragCoord.xy) - 0.5) * ditherStrength; // Apply centered noise
      normalizedY = clamp(normalizedY, 0.0, 1.0); // Re-clamp after adding noise to prevent out-of-bounds values
      
      // Use a smoother curve for better gradient transitions
      // Apply smoothstep twice for even smoother interpolation
      float smoothGradient = smoothstep(0.0, 1.0, normalizedY);
      smoothGradient = smoothstep(0.0, 1.0, smoothGradient);
      
      return smoothGradient;
    }
    
    // Edge-based rim lighting that only affects borders - rotation independent
    float getEdgeRimLighting() {
      // Card dimensions: 7.5 x 10 with 0.5 radius corners
      float cardWidth = 7.5;
      float cardHeight = 10.0;
      float cornerRadius = 0.5;
      
      // Get absolute local position for edge detection
      vec2 absPos = abs(vLocalPosition.xy);
      
      // Calculate distance from edges
      float edgeDistanceX = cardWidth * 0.5 - absPos.x;
      float edgeDistanceY = cardHeight * 0.5 - absPos.y;
      
      // Handle rounded corners
      vec2 cornerOffset = max(absPos - vec2(cardWidth * 0.5 - cornerRadius, cardHeight * 0.5 - cornerRadius), 0.0);
      float cornerDistance = length(cornerOffset);
      
      // Distance from edge (accounting for corners)
      float edgeDistance;
      if (cornerOffset.x > 0.0 || cornerOffset.y > 0.0) {
        // In corner region
        edgeDistance = cornerRadius - cornerDistance;
      } else {
        // In straight edge region
        edgeDistance = min(edgeDistanceX, edgeDistanceY);
      }
      
      // EXCLUDE BEVELS: Check if we're on the front/back face (not on beveled edges)
      // Front and back faces have normals close to (0,0,±1)
      vec3 localNormal = normalize(vViewNormal);
      float faceAlignment = abs(localNormal.z); // How aligned the normal is with Z-axis
      float bevelMask = smoothstep(0.7, 0.9, faceAlignment); // Only apply to faces, not bevels
      
      // Create rim effect - only activate near edges
      float rimWidth = 0.015; // Slightly increased for better visibility
      float rimFalloff = 12.0; // Increased for sharper metallic edge
      
      // Create smooth rim that's strongest at edges and fades inward
      float rim = 1.0 - smoothstep(0.0, rimWidth, edgeDistance);
      rim = pow(rim, rimFalloff);
      
      // Apply bevel mask to exclude beveled areas
      rim *= bevelMask;
      
      // Enhanced metallic fresnel for view-dependent enhancement
      vec3 cameraWorldPos = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      cameraWorldPos.z = referenceCameraZ;
      vec3 viewDirection = normalize(cameraWorldPos - vWorldPosition);
      vec3 worldNormal = normalize(vWorldNormal);
      float fresnel = 1.0 - abs(dot(viewDirection, worldNormal));
      
      // More pronounced metallic fresnel curve
      fresnel = pow(fresnel, 2.5); // Reduced from 4.0 for broader metallic reflection
      
      // Combine edge-based rim with enhanced metallic fresnel
      return rim * (0.4 + 0.8 * fresnel); // Increased fresnel contribution for more metallic look
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
      
      // Apply edge-based rim lighting instead of global fresnel
      float edgeRim = getEdgeRimLighting();
      // Apply rim lighting with screen blending for more natural metallic look
      vec3 metallicColor = vec3(1.0, 1.0, 1.0); // Cool metallic silver-blue
      vec3 rimHighlight = metallicColor * edgeRim * 0.20; // Reduced intensity for screen blending
      
      // Screen blending: 1 - (1 - base) * (1 - highlight)
      finalColor = vec3(1.0) - (vec3(1.0) - finalColor) * (vec3(1.0) - rimHighlight);
      
      // Enhance overall brightness slightly
      finalColor *= 1.4;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// Extend the material so we can use it as JSX
extend({ NFTMaterial });

// Custom shader material for iridescent SVG effect
const IridescentSVGMaterial = shaderMaterial(
  {
    // Uniforms
    map: null,
    matcap1: null,
    matcap3: null,
    time: 0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vViewNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      
      vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
      vViewPosition = -viewPosition.xyz;
      vViewNormal = normalize((viewMatrix * modelMatrix * vec4(normal, 0.0)).xyz);
      
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  // Fragment shader
  `
    uniform sampler2D map;
    uniform sampler2D matcap1;
    uniform sampler2D matcap3;
    uniform float time;
    
    varying vec2 vUv;
    varying vec3 vViewNormal;
    varying vec3 vViewPosition;
    
    vec2 getMatcapUV(vec3 viewNormal) {
      vec3 n = normalize(viewNormal);
      vec3 viewPos = normalize(vViewPosition);
      vec3 x = normalize(vec3(viewPos.z, 0.0, -viewPos.x));
      vec3 y = cross(viewPos, x);
      vec2 uv = vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
      return uv;
    }
    
    vec2 rotateUV(vec2 uv, float angle) {
      float cos_angle = cos(angle);
      float sin_angle = sin(angle);
      uv -= 0.5;
      vec2 rotated = vec2(
        uv.x * cos_angle - uv.y * sin_angle,
        uv.x * sin_angle + uv.y * cos_angle
      );
      return rotated + 0.5;
    }
    
    // Blur function for matcap sampling
    vec3 sampleMatcapBlurred(sampler2D matcapTexture, vec2 uv, float blurRadius) {
      vec3 color = vec3(0.0);
      float total = 0.0;
      
      // Sample multiple points in a circle pattern for blur effect
      for (int i = 0; i < 8; i++) {
        float angle = float(i) * 3.14159265 * 2.0 / 8.0;
        vec2 offset = vec2(cos(angle), sin(angle)) * blurRadius;
        
        // Sample the texture at the offset position
        color += texture2D(matcapTexture, uv + offset).rgb;
        total += 1.0;
      }
      
      // Add center sample with higher weight
      color += texture2D(matcapTexture, uv).rgb * 2.0;
      total += 2.0;
      
      return color / total;
    }
    
    void main() {
      // Sample the base texture
      vec4 baseColor = texture2D(map, vUv);
      
      // Skip processing for transparent areas
      if (baseColor.a < 0.1) {
        discard;
      }
      
      // Get matcap UV
      vec2 matcapUV = getMatcapUV(normalize(vViewNormal));
      
      // Define blur radius (adjust this value to control blur amount)
      float blurRadius = 0.015; // Increase for more blur, decrease for less
      
      // Sample matcap textures with blur and animated rotation
      vec3 matcap1Color = sampleMatcapBlurred(matcap1, rotateUV(matcapUV, time * 0.5), blurRadius);
      vec3 matcap3Color = sampleMatcapBlurred(matcap3, rotateUV(matcapUV, time * 0.3 + 3.14159), blurRadius);
      
      // Combine base texture with iridescent effects
      vec3 finalColor = baseColor.rgb;
      
      // Add iridescent matcap effects
      finalColor *= mix(vec3(1.0), matcap1Color, 0.6);
      finalColor *= mix(vec3(1.0), matcap3Color, 0.8);
      
      // Enhance brightness for more reflective look
      finalColor *= 1.5;
      
      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `
);

// Extend the iridescent material
extend({ IridescentSVGMaterial });

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
  const [matcap1, matcap3, matcapIridescent] = useTexture([
    "/textures/new.webp",
    "/textures/3.webp",
    "/textures/card-back.png",
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
        referenceCameraZ: 7.5,
      })}
    </mesh>
  );
}

// Enhanced SVG component with optional iridescent effect
function SVGImage({
  src,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  useIridescent = false,
}: {
  src: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  useIridescent?: boolean;
}) {
  const texture = useTexture(src);
  const materialRef = useRef<any>(null);

  // Load matcap textures for iridescent effect
  const [matcap1, matcap3] = useTexture([
    "/textures/new.webp",
    "/textures/3.webp",
  ]);

  // Configure texture for crisp rendering
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Animate the iridescent effect
  useFrame((state) => {
    if (materialRef.current && useIridescent) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      {useIridescent ? (
        React.createElement("iridescentSVGMaterial", {
          ref: materialRef,
          map: texture,
          matcap1: matcap1,
          matcap3: matcap3,
          transparent: true,
          side: THREE.DoubleSide,
        })
      ) : (
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0}
          side={THREE.DoubleSide}
        />
      )}
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
    const height = 10;
    const radius = 0.5;

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
      depth: 0.2, // 24 points of extrusion
      bevelEnabled: true,
      bevelThickness: 0.09, // 5 bevel thickness
      bevelSize: 0.12, // 5 bevel size
      bevelSegments: 8, // Increased from 2 to 3 for smoother bevels
      curveSegments: 56, // Increased from 30 to 32 for even smoother curves
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Ensure normals are computed properly for all surfaces
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  return (
    <>
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
          position={[0, 0, 0.34]}
          scale={[7.5, 10, 1]}
        />

        <SVGImage
          src={`/textures/difficulty-${challengeDifficulty}.svg`}
          position={[0, 0, 0.34]}
          scale={[7.5, 10, 1]}
        />

        <SVGImage
          src="/textures/qualified-text.svg"
          position={[0, 0, 0.34]}
          scale={[7.5, 10, 1]}
        />

        {/* Move card-back to the back of the card with iridescent effect */}
        <SVGImage
          src="/textures/card-back.svg"
          position={[0, 0, -0.14]}
          scale={[-7.5, 10, 1]}
          useIridescent={true}
        />

        <Text
          position={[-3.15, 1, 0.35]}
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

      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.005}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        onStart={handleControlsStart}
        onEnd={handleControlsEnd}
      />
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
          camera={{
            position: [0, 0, 16],
            rotation: [0, 0, 0],
            near: 0.1,
            far: 1000,
            fov: 45,
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

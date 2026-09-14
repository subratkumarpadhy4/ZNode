import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ROOM_WIDTH  = 30;
const ROOM_DEPTH  = 50;
const ROOM_HEIGHT = 8;

// Grid overlay via proper THREE.BufferGeometry with refs
function GridLines() {
  const groupRef = useRef();

  useEffect(() => {
    if (!groupRef.current) return;
    const material = new THREE.LineBasicMaterial({ color: '#334155', opacity: 0.5, transparent: true });

    // Lines along Z (spaced every 2 on X)
    for (let x = -ROOM_WIDTH / 2; x <= ROOM_WIDTH / 2; x += 2) {
      const pts = [new THREE.Vector3(x, 0.02, -ROOM_DEPTH / 2), new THREE.Vector3(x, 0.02, ROOM_DEPTH / 2)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      groupRef.current.add(new THREE.Line(geo, material));
    }

    // Lines along X (spaced every 2 on Z)
    for (let z = -ROOM_DEPTH / 2; z <= ROOM_DEPTH / 2; z += 2) {
      const pts = [new THREE.Vector3(-ROOM_WIDTH / 2, 0.02, z), new THREE.Vector3(ROOM_WIDTH / 2, 0.02, z)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      groupRef.current.add(new THREE.Line(geo, material));
    }

    return () => {
      // cleanup on unmount
      while (groupRef.current && groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        child.geometry.dispose();
        groupRef.current.remove(child);
      }
      material.dispose();
    };
  }, []);

  return <group ref={groupRef} />;
}

export default function FactoryRoom() {
  return (
    <group>
      {/* FLOOR */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#2d3748" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* GRID OVERLAY — imperative THREE.js lines via useEffect + ref */}
      <GridLines />

      {/* BACK WALL */}
      <mesh receiveShadow position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#1e2a3d" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* LEFT WALL */}
      <mesh receiveShadow position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1e2a3d" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* RIGHT WALL */}
      <mesh receiveShadow position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color="#1e2a3d" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* CEILING GIRDERS — 5 beams */}
      {[-20, -10, 0, 10, 20].map((z) => (
        <mesh key={z} position={[0, ROOM_HEIGHT, z]} castShadow>
          <boxGeometry args={[ROOM_WIDTH, 0.4, 0.6]} />
          <meshStandardMaterial color="#1e2a3d" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* SUPPORT COLUMNS — 6 */}
      {[
        [-10, -15],
        [ 10, -15],
        [-10,   0],
        [ 10,   0],
        [-10,  15],
        [ 10,  15],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, ROOM_HEIGHT / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.6, ROOM_HEIGHT, 0.6]} />
          <meshStandardMaterial color="#243447" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

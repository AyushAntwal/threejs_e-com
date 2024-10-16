'use client'
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import React, { useRef } from "react";
import { useSnapshot } from "valtio";
import * as THREE from "three";
import { state } from "@/store/store";
import { AccumulativeShadows, Decal, RandomizedLight, useGLTF, useTexture } from "@react-three/drei";
import { useSphere } from "@react-three/cannon";
function CameraRig({ children }) {
  const group = useRef()
  const snap = useSnapshot(state)
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [snap.intro ? -state.viewport.width / 4 : 0, 0, 2], 0.25, delta)
    easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 3, 0], 0.25, delta)
  })
  return <group ref={group}>{children}</group>
}

function Backdrop() {
  const shadows = useRef()
  useFrame((state, delta) => easing.dampC(shadows.current.getMesh().material.color, state.color, 0.25, delta))
  return (
    <AccumulativeShadows ref={shadows} temporal frames={60} alphaTest={0.85} scale={4} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.14]}>
      <RandomizedLight amount={4} radius={9} intensity={2.95} ambient={0.25} position={[5, 5, -10]} />
      <RandomizedLight amount={4} radius={5} intensity={1.85} ambient={0.55} position={[-5, 5, -9]} />
    </AccumulativeShadows>
  )
}

function Shirt(props) {
  const [ref] = useSphere(() => ({
    mass: 0,
    tension: 1000,
    friction: 30,
  }))
  const snap = useSnapshot(state)
  const texture = useTexture(snap.image ? snap.image : `/${snap.decal}.png`);
  const textureWidth = texture?.image?.width;
  const textureHeight = texture?.image?.height;
  console.log(`Texture Width: ${textureWidth}, Texture Height: ${textureHeight}`);
  console.log(texture?.source?.data);
  
  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb');
  console.log({ nodes, materials });

  useFrame((state, delta) => easing.dampC(materials.lambert1.color, snap.color, 0.25, delta))
  const scale = textureWidth && textureHeight ? [textureWidth / snap.scale, textureHeight / snap.scale, 1] : [0.15, 0.15, 0.15];

  return (
    <mesh ref={ref} castShadow geometry={nodes.T_Shirt_male.geometry} material={materials.lambert1} material-roughness={1} {...props} dispose={null}>
      <Decal position={snap.position || [0, 0, 0]} rotation={[0, 0, 0]} scale={scale} map={texture} anisotropy={4} />
    </mesh>
  )
}

useGLTF.preload('/shirt_baked_collapsed.glb')
  ;['/react.png',].forEach(useTexture.preload)


export { CameraRig, Shirt, Backdrop };
// Auto-generated by https://github.com/react-spring/gltfjsx

import * as THREE from "three"
import React, { useEffect, useRef, useState, useMemo } from "react"
import { useLoader, useFrame } from "react-three-fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils"
import lerp from "lerp"
import { getMouseDegrees } from "./utils"

const avatars = [
  { position: [-50, 1.5, 80], rotation: [0, Math.PI, 0] },
  { position: [75, 0, 120], rotation: [0, Math.PI, 0] },
  { position: [25, 0, 27.5], rotation: [0, Math.PI + Math.PI / 4, 0] },
  { position: [85, 1, 20], rotation: [0, 0, 0] },
  { position: [97.5, 1.5, -47.5], rotation: [0, Math.PI + Math.PI / 4, 0] },
]

function moveJoint(mouse, joint, degreeLimit = 40) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
  joint.rotation.xD = lerp(joint.rotation.xD || 0, degrees.y, 0.1)
  joint.rotation.yD = lerp(joint.rotation.yD || 0, degrees.x, 0.1)
  joint.rotation.x = THREE.Math.degToRad(joint.rotation.xD)
  joint.rotation.y = THREE.Math.degToRad(joint.rotation.yD)
}

function Avatar({ data, stacy, animations }) {
  const group = useRef()
  const actions = useRef()
  const [mixer] = useState(() => new THREE.AnimationMixer())
  useFrame((state, delta) => mixer.update(delta))
  useEffect(() => {
    actions.current = { idle: mixer.clipAction(animations[8], group.current) }
    actions.current.idle.play()
    return () => animations.forEach(clip => mixer.uncacheClip(clip))
  }, [])

  const [skinnedMesh, mixamorigHips, mixamorigNeck, mixamorigSpine, animOffset] = useMemo(() => {
    const clonedStacy = SkeletonUtils.clone(stacy)
    const skinnedMesh = clonedStacy.children.find(obj => obj.type === 'SkinnedMesh')
    const mixamorigHips = clonedStacy.children.find(obj => obj.type === 'Bone')
    const mixamorigNeck = skinnedMesh.skeleton.bones.find(obj => obj.name === 'mixamorigNeck')
    const mixamorigSpine = skinnedMesh.skeleton.bones.find(obj => obj.name === 'mixamorigSpine')
    const animOffset = Math.random()
    return [skinnedMesh, mixamorigHips, mixamorigNeck, mixamorigSpine, animOffset]
  }, [])

  useFrame(({ clock }, delta) => {
    const mouse = { x: 0, y: 0 }
    const dir = animOffset > 0.5 ? 1 : -1
    mouse.x = Math.sin((clock.getElapsedTime() * animOffset + animOffset) * dir) * 0.5 + 0.5
    mouse.y = Math.cos((clock.getElapsedTime() * animOffset + animOffset) * dir) * 0.5 + 0.5

    mixer.update(delta)
    moveJoint(mouse, mixamorigNeck)
    moveJoint(mouse, mixamorigSpine)
  })

  return (
    <group ref={group} position={data.position} rotation={data.rotation} scale={[15, 15, 15]} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={[0.01, 0.01, 0.01]}>
        <primitive object={mixamorigHips} />
        <skinnedMesh castShadow geometry={skinnedMesh.geometry} skeleton={skinnedMesh.skeleton} rotation={[-Math.PI / 2, 0, 0]} scale={[100, 100, 100]}>
          <meshBasicMaterial attach="material" color={0x000000} skinning />
        </skinnedMesh>
      </group>
    </group>
  )
}

export default function Model({ ...props }) {
  const gltf = useLoader(GLTFLoader, "/assets/stacy.glb")
  // const texture = useLoader(THREE.TextureLoader, "/assets/stacy.jpg")
  // texture.encoding = THREE.GammaEncoding

  useEffect(() => {
    gltf.nodes['Stacy'].add(gltf.nodes['mixamorigHips'])
  }, [])

  return (
    <>
      {avatars.map((data, index) => {
        return <Avatar key={index} data={data} stacy={gltf.nodes['Stacy']} animations={gltf.animations} />
      })}
    </>
  )
}
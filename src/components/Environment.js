import * as THREE from 'three'
import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export default function Environment({ setLoaded, setProgress }) {
  const { scene } = useThree()

  const actions = useRef()
  const [mixer] = useState(() => new THREE.AnimationMixer())
  useFrame((state, delta) => mixer.update(delta))

  const gltf = useLoader(GLTFLoader, 'assets/LittlestTokyo.glb', loader => {
    loader.manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      setProgress(parseInt(Math.min(itemsLoaded / 14, 1) * 100));
    };

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('assets/draco/gltf/');
    loader.setDRACOLoader(dracoLoader)
  })

  const r = "/assets/envMap/";
  const urls = [r + "px.png", r + "nx.png",
  r + "py.png", r + "ny.png",
  r + "pz.png", r + "nz.png"];
  const [envMap] = useLoader(THREE.CubeTextureLoader, [urls])

  useEffect(() => {
    // scene.fog = new THREE.FogExp2(0xeeeeee, 0.01);

    gltf.scene.scale.set(0.5, 0.5, 0.5)

    const box = new THREE.Box3();
    box.setFromObject(gltf.scene)

    const center = new THREE.Vector3()
    box.getCenter(center)
    gltf.scene.position.x -= center.x
    gltf.scene.position.z -= center.z
    gltf.scene.position.y -= box.min.y
    gltf.scene.position.y -= 6.25

    Object.values(gltf.nodes).filter(node => node.type === 'Mesh').forEach(node => {
      node.receiveShadow = node.castShadow = true
      node.material.envMap = envMap
      node.material.envMapIntensity = 2
      node.material.needsUpdate = true
    })

    setProgress(100);
    setLoaded(true)
    document.body.style.background = '#2f2f2f'
    scene.add(gltf.scene)

    actions.current = { animation: mixer.clipAction(gltf.animations[0], gltf.scene) }
    return () => gltf.animations.forEach(clip => mixer.uncacheClip(clip))
  }, [])

  useEffect(() => void actions.current.animation.play(), [])

  return (
    <></>
  )
}
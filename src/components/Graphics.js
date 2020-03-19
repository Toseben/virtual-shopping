import * as THREE from 'three'
import React, { useRef, Suspense, useEffect } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })
function Controls() {
  const controls = useRef()
  const { camera, gl } = useThree()
  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}

function Model() {
  const { scene } = useThree()

  const gltf = useLoader(GLTFLoader, 'assets/LittlestTokyo.glb', loader => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('assets/draco/gltf/');
    loader.setDRACOLoader(dracoLoader)
  })

  useEffect(() => {
    scene.add(gltf.scene)
  })

  return (
    <></>
  )
}

const Graphics = ({ mobile }) => {
  return (
    <Canvas
      gl={{ alpha: false, antialias: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xeeeeee)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
      }}
      camera={{ position: [0, 7.5, 1000], far: 15000, near: 1 }}>

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <ambientLight intensity={2} />
      <Controls />
    </Canvas>
  );
};

export default Graphics;
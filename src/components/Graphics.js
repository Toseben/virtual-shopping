import * as THREE from 'three'
import React, { useRef, Suspense, useEffect, useState, useMemo } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import ControlsPointer from './ControlsPointer'
import ControlsDeviceOrientation from './ControlsDeviceOrientation'

import Environment from './Environment'
import Products from './Products'
import Lights from './Lights'
import Effects from './Effects'
import Stacy from './Stacy'

extend({ OrbitControls })
function ControlsOrbit() {
  const controls = useRef()
  const { camera, gl } = useThree()

  useEffect(() => {
    camera.position.set(0, 500, 0)
    camera.fov = 50
    camera.updateProjectionMatrix()
  }, [])

  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}

function Boundaries() {
  const gltf = useLoader(GLTFLoader, 'assets/boundaries_v002.glb')

  return (
    <mesh
      name="boundaries">
      <bufferGeometry attach="geometry" {...gltf.__$[2].geometry} />
      <meshBasicMaterial attach="material" color="hotpink" visible={false} />
    </mesh>
  )
}

const Graphics = ({
  hoverProduct,
  setHoverProduct,
  selectProduct,
  setSelectProduct,
  mobile,
  activate,
  setActivate,
  setStuck,
  loaded,
  setLoaded,
  setProgress,
  materialStyle,
  ...props }) => {

  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xeeeeee)
        // gl.toneMapping = THREE.ACESFilmicToneMapping
        // gl.outputEncoding = THREE.sRGBEncoding
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
      camera={{
        far: 1000, near: 0.1, fov: 100, 
        position: new THREE.Vector3(-45, 25, 134.75),
        rotation: new THREE.Vector3(0.1475, 0, 0)
      }}>

      <Suspense fallback={null}>
        <Environment setLoaded={setLoaded} setProgress={setProgress} />
        <Effects />
      </Suspense>

      {loaded &&
        <Suspense fallback={null}>
          <Products hoverProduct={hoverProduct} selectProduct={selectProduct} materialStyle={materialStyle} />
          <Boundaries />
          <Stacy />
        </Suspense>
      }

      <Lights />
      <ambientLight intensity={0.8} />
      {!mobile &&
        <ControlsPointer
          activate={activate}
          setActivate={setActivate}
          setStuck={setStuck}
          hoverProduct={hoverProduct}
          setHoverProduct={setHoverProduct}
          setSelectProduct={setSelectProduct}
        />
      }
      {mobile && activate &&
        <ControlsDeviceOrientation
          activate={activate}
          setActivate={setActivate}
          setStuck={setStuck}
          hoverProduct={hoverProduct}
          setHoverProduct={setHoverProduct}
          setSelectProduct={setSelectProduct}
        />
      }
      {/* {mobile && <ControlsOrbit />} */}

    </Canvas>
  );
};

export default Graphics;
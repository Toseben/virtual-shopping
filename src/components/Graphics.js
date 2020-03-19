import * as THREE from 'three'
import React, { useRef, Suspense, useEffect, useState } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from 'react-three-fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { PointerLockControls } from '../libs/PointerLockControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })
function ControlsOrbit() {
  const controls = useRef()
  const { camera, gl } = useThree()
  useFrame(() => controls.current.update())
  return (
    <orbitControls ref={controls} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
  )
}

extend({ PointerLockControls })
function ControlsPointer({ activate, setActivate, ...props }) {
  const controls = useRef()
  const { camera, gl } = useThree()

  const prevTime = useRef(performance.now())
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const [moveForward, setMoveForward] = useState(false)

  useFrame(() => {
    if (controls.current.isLocked === true) {

      const time = performance.now();
      const delta = (time - prevTime.current) / 1000;

      velocity.current.x -= velocity.current.x * 10.0 * delta;
      velocity.current.z -= velocity.current.z * 10.0 * delta;

      direction.current.z = Number(moveForward);
      direction.current.normalize();

      if (moveForward) velocity.current.z -= direction.current.z * 1000.0 * delta;

      controls.current.moveForward(- velocity.current.z * delta);

      prevTime.current = time;

    }

  })

  useEffect(() => {
    camera.position.set(0, 0, 500)
  }, [])

  useEffect(() => {
    if (activate) controls.current.lock()
  }, [activate])

  const onMouseDown = () => {
    setMoveForward(true)
  }

  const onMouseUp = () => {
    setMoveForward(false)
  }

  const onLock = () => {}

  const onUnlock = () => {
    setActivate(false)
  }

  useEffect(() => {
    controls.current.addEventListener('lock', onLock);
    controls.current.addEventListener('unlock', onUnlock);

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseout', onMouseUp)
    return () => {
      controls.current.removeEventListener('lock', onLock);
      controls.current.removeEventListener('unlock', onUnlock);

      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseout', onMouseUp)
    }
  }, [])

  return (
    <pointerLockControls ref={controls} args={[camera, gl.domElement]} />
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
    gltf.scene.scale.set(0.5, 0.5, 0.5)

    const box = new THREE.Box3();
    box.setFromObject(gltf.scene)

    const center = new THREE.Vector3()
    box.getCenter(center)
    gltf.scene.position.x -= center.x
    gltf.scene.position.z -= center.z
    gltf.scene.position.y -= box.min.y
    gltf.scene.position.y -= 35

    scene.add(gltf.scene)
  })

  return (
    <></>
  )
}

const Graphics = ({ mobile, activate, setActivate, ...props }) => {
  return (
    <Canvas
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xeeeeee)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputEncoding = THREE.sRGBEncoding
      }}
      camera={{ far: 15000, near: 1 }}>

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <ambientLight intensity={2} />
      {/* <ControlsOrbit /> */}
      <ControlsPointer activate={activate} setActivate={setActivate} />
    </Canvas>
  );
};

export default Graphics;
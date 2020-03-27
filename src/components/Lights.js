import * as THREE from 'three'
import React, { useEffect } from 'react'
import { useThree } from 'react-three-fiber';

export default function Lights() {
  const { scene } = useThree()

  useEffect(() => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(256, 256, 256);
    light.castShadow = true;
    scene.add(light);

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 1024;
    light.shadow.bias = -0.002;

    const d = 200;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    // const helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(helper);
  }, [])

  return (
    <></>
  )
}
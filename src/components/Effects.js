import * as THREE from 'three'
import React, { useRef, useEffect, useMemo } from 'react'
import { extend, useThree, useFrame, useLoader } from 'react-three-fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { LUTShader } from './LUTShader';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass })

export default function Effects() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), []);
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => {
    if (composer.current) composer.current.render()
  }, 1)

  const [lookup] = useLoader(THREE.TextureLoader, ["/assets/lut_1.jpg"])

  if (lookup) {
    lookup.genMipmaps = false;
    lookup.minFilter = THREE.LinearFilter;
    lookup.magFilter = THREE.LinearFilter;
    lookup.wrapS = THREE.ClampToEdgeWrapping;
    lookup.wrapT = THREE.ClampToEdgeWrapping;
  }

  const bloom = {
    resolution: aspect,
    strength: 0.33,
    radius: 0.025,
    threshold: 0.9,
  };

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <unrealBloomPass
        attachArray="passes"
        args={[bloom.resolution, bloom.strength, bloom.radius, bloom.threshold]}
      />
      <shaderPass
        attachArray="passes"
        args={[GammaCorrectionShader]}
      />
      <shaderPass
        attachArray="passes"
        args={[LUTShader]}
        material-uniforms-lookup-value={lookup}
      />
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        material-uniforms-resolution-value={[1 / size.width, 1 / size.height]}
        renderToScreen
      />
    </effectComposer>
  )
}

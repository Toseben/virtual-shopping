import React, { useState } from 'react'
import { useTrail, animated, useSpring } from 'react-spring'
import Div100vh from 'react-div-100vh'
import './styles/styles.scss';
import './styles/trigger.scss'

import Graphics from './components/Graphics';
import MessageHub from './components/MessageHub';
import ProgressBar from "./components/ProgressBar";

const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

const items = ['Turn', 'Back', 'svg', 'Dead', 'End']
const instructions = ['Click to play', '', 'Controls', 'Look: Mouse', 'Move: Mouse Press']
const mobileInstructions = ['Touch to play', '', 'Controls', 'Look: Device Gyro', 'Move: Touch Screen']
const config = { mass: 5, tension: 2000, friction: 200 }

const products = {
  'product1_Sushi_Platter': { price: 5 },
  'product2_Sushi_Platter': { price: 5 },
  'product3_Sushi_Platter': { price: 5 },
  'product4_Toys': { price: 3 },
  'product5_Crate_of_Soft_Drinks': { price: 10 },
  'product6_Bicycle': { price: 100 },
  'product7_Bonsai_Tree': { price: 50 },
  'product8_Statue': { price: 25 },
  'product9_Broom': { price: 10 },
  'product10_Newspapers': { price: 3 },
  'product11_Traffic_Cone': { price: 5 },
  'product12_Bucket': { price: 10 }
}

export default function App() {
  const [stuck, setStuck] = useState(false)
  const [activate, setActivate] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [materialStyle, setMaterialStyle] = useState('basic')
  const [mobile] = useState(isMobile);

  const [hoverProduct, setHoverProduct] = useState(null)
  const [selectProduct, setSelectProduct] = useState(null)

  const mousePressed = () => {
    setSelectProduct(null)
    setActivate(true)
  }

  const onSwatchClick = style => {
    setMaterialStyle(style)
  }

  const trail = useTrail(items.length, {
    config,
    opacity: stuck ? 1 : 0,
    x: stuck ? 0 : 20,
    height: stuck ? 80 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  })

  const instructionsTrail = useTrail(instructions.length, {
    config,
    opacity: !activate ? 1 : 0,
    x: !activate ? 0 : 20,
    height: !activate ? 80 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  })

  const productTitle = useSpring({
    config,
    opacity: selectProduct ? 1 : 0,
    x: selectProduct ? 0 : 20,
    height: selectProduct ? 80 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  })

  const productName = selectProduct ? selectProduct.split('_').filter(word => !word.includes('product')).join(' ') : null
  const isFancy = materialStyle === 'gold' ? ' - Rich Edition' : ''

  return (
    <>
      {activate && <>
        <MessageHub />
        {!hoverProduct && <div className="loader-5 center"><span></span></div>}
        {hoverProduct && <div className="loader-6 center"><span></span></div>}
      </>}

      <div className={`overlay ${loaded ? 'hidden' : ''}`}>
        <ProgressBar progress={progress} />
      </div>

      {selectProduct && <>
        <div className="trails-main product">
          <div>
            <animated.div
              className="trails-text product"
              style={{ transform: productTitle.x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
              <animated.div style={{ height: productTitle.height }}>{productName}</animated.div>
            </animated.div>
          </div>
        </div>
        <div className="trails-main price">
          <div>
            <animated.div
              className="trails-text product"
              style={{ transform: productTitle.x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
              <animated.div style={{ height: productTitle.height }}>
                {`${products[selectProduct].price * (materialStyle === 'gold' ? 2 : 1)} Coins${isFancy}`}
              </animated.div>
            </animated.div>
          </div>
        </div>
      </>}

      <div className={`styleSelector ${selectProduct ? 'select' : ''}`}>
        <div className={`swatchContainer`}>
          <div className="basic" onClick={() => onSwatchClick('basic')}></div>
          <div className="gold" onClick={() => onSwatchClick('gold')}></div>
        </div>
        <div className="titleContainer">
          <p className="basicTitle">Basic</p>
          <p className="goldTitle">Gold</p>
        </div>
      </div>

      <div className={`trails-main ${stuck ? 'stuck' : ''}`}>
        <div>
          {trail.map(({ x, height, ...rest }, index) => {
            if (items[index] === 'svg') {
              return <animated.div
                key={items[index]}
                className="trails-text svg"
                style={{ ...rest, transform: x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
                <animated.img src="/assets/deadend.svg"></animated.img>
              </animated.div>
            } else {
              return <animated.div
                key={items[index]}
                className="trails-text"
                style={{ ...rest, transform: x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
                <animated.div style={{ height }}>{items[index]}</animated.div>
              </animated.div>
            }
          })}
        </div>
      </div>

      <div id="blocker" className={`${activate ? 'hidden' : ''} ${selectProduct ? 'productPage' : ''}`} onClick={mousePressed}>
        {!selectProduct && <div className={`trails-main ${activate ? 'stuck' : ''}`}>
          <div>
            {instructionsTrail.map(({ x, height, ...rest }, index) => {
              return <animated.div
                key={items[index]}
                className="trails-text instructions"
                style={{ ...rest, transform: x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
                <animated.div style={{ height }}>{mobile ? mobileInstructions[index] : instructions[index]}</animated.div>
              </animated.div>
            })}
          </div>
        </div>}
      </div>

      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <Graphics
          hoverProduct={hoverProduct}
          setHoverProduct={setHoverProduct}
          selectProduct={selectProduct}
          setSelectProduct={setSelectProduct}
          setProgress={setProgress}
          loaded={loaded}
          setLoaded={setLoaded}
          setStuck={setStuck}
          mobile={mobile}
          activate={activate}
          setActivate={setActivate}
          materialStyle={materialStyle}>
        </Graphics>
      </Div100vh>
    </>
  );
}

import React, { useState, useRef } from 'react'
import { useTrail, animated } from 'react-spring'
import Div100vh from 'react-div-100vh'
import './styles/styles.scss';
import Graphics from './components/Graphics';
import MessageHub from './components/MessageHub';
import ProgressBar from "./components/ProgressBar";

const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

const items = ['Turn', 'Back', 'svg', 'Dead', 'End']
const instructions = ['Click to play', '', 'Controls', 'Look: Mouse', 'Move: Mouse Press']
const config = { mass: 5, tension: 2000, friction: 200 }

export default function App() {
  const [stuck, setStuck] = useState(false)
  const [activate, setActivate] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mobile] = useState(isMobile);

  const mousePressed = () => {
    setActivate(true)
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

  return (
    <>
      {activate && <MessageHub />}

      <div className={`overlay ${loaded ? 'hidden' : ''}`}>
        <ProgressBar progress={progress} />
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

      <div id="blocker" className={`${activate ? 'hidden' : ''}`} onClick={mousePressed}>
        <div className={`trails-main ${activate ? 'stuck' : ''}`}>
          <div>
            {instructionsTrail.map(({ x, height, ...rest }, index) => {
              return <animated.div
                key={items[index]}
                className="trails-text instructions"
                style={{ ...rest, transform: x.interpolate(x => `translate3d(0,${x}px,0)`) }}>
                <animated.div style={{ height }}>{instructions[index]}</animated.div>
              </animated.div>
            })}
          </div>
        </div>

      </div>

      <Div100vh style={{ height: `100rvh` }} className="vis-container">
        <Graphics setProgress={setProgress} loaded={loaded} setLoaded={setLoaded} setStuck={setStuck} mobile={mobile} activate={activate} setActivate={setActivate}></Graphics>
      </Div100vh>
    </>
  );
}

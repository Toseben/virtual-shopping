import React, { useState } from 'react'
import Div100vh from 'react-div-100vh'
import './styles/styles.scss';
import Graphics from './components/Graphics';

const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

export default function App() {
  const [activate, setActivate] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [mobile] = useState(isMobile);

  const mousePressed = () => {
    setActivate(true)
  }

  return (
    <>
      <div id="overlay" className={`overlay hidden`}>
        <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
      </div>
      <div className="App" onClick={mousePressed}>
        <Div100vh style={{ height: `100rvh` }} className="vis-container">
          <Graphics setLoaded={setLoaded} mobile={mobile} activate={activate} setActivate={setActivate}></Graphics>
        </Div100vh>
      </div>
    </>
  );
}

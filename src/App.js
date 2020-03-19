import * as React from 'react';
import Div100vh from 'react-div-100vh'
import './styles/styles.scss';
import Graphics from './components/Graphics';

const isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

export default function App() {
  const [loaded, setLoaded] = React.useState(false)
  const [mobile] = React.useState(isMobile);

  return (
    <>
      {/* <div className={`overlay ${loaded ? 'hidden' : ''}`}>
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      </div> */}
      <div className="App">
        <Div100vh style={{ height: `100rvh` }} className="vis-container">
          <Graphics setLoaded={setLoaded} mobile={mobile}></Graphics>
        </Div100vh>
      </div>
    </>
  );
}

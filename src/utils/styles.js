import styled, { createGlobalStyle } from 'styled-components'
import { animated } from 'react-spring'

export const Container = styled('div')`
  position: fixed;
  z-index: 1;
  width: 0 auto;
  top: ${props => (props.top ? '30px' : 'unset')};
  bottom: ${props => (props.top ? 'unset' : '30px')};
  margin: 0 auto;
  left: 30px;
  right: 30px;
  display: flex;
  flex-direction: ${props => (props.top ? 'column-reverse' : 'column')};
  pointer-events: none;
  align-items: ${props => (props.position === 'center' ? 'center' : `flex-${props.position || 'end'}`)};
  transition: opacity 0.5s;
`

export const Message = styled(animated.div)`
  border-radius: 15px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: auto;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.23);
  @media (max-width: 768px), (max-height: 768px) {
    border-radius: 8px;
  }
`

export const Content = styled('div')`
  border-radius: 15px;
  color: black;
  background: white;
  opacity: 0.9;
  padding: 0 22px;
  font-size: 1.25em;
  font-weight: 100;
  display: grid;
  grid-template-columns: ${props => (props.canClose === false ? '1fr' : '1fr auto')};
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  margin-top: ${props => (props.top ? '0' : '5px')};
  margin-bottom: ${props => (props.top ? '0px' : '0')};
  @media (max-width: 768px), (max-height: 768px) {
    border-radius: 8px;
    font-size: 0.75em;
    padding: 0 10px;
  }
`
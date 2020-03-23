import React, { useState, useEffect } from 'react'
import { useTransition } from 'react-spring'
import { Container, Message, Content } from '../utils/styles.js'

let id = 0
const messages = [
  'What should I get this time?',
  'Hmmm... They all look so good!',
  'How much for this one?',
]

export default function MessageHub({ config = { tension: 125, friction: 20, precision: 0.1 } }) {
  const [refMap] = useState(() => new WeakMap())
  const [items, setItems] = useState([])

  useEffect(() => {
    setInterval(() => {
      setItems([...items, {
        "key": id++,
        "msg": messages[id % messages.length]
      }])
    }, 1000)
  }, [])

  const transitions = useTransition(items, item => item.key, {
    from: { opacity: 0, height: 0, life: '100%' },
    enter: item => async next => await next({ opacity: 1, height: refMap.get(item).offsetHeight }),
    leave: item => async (next, cancel) => {
      await new Promise(resolve => setTimeout(resolve, 600))
      await next({ opacity: 0, height: 0 })
    },
    onRest: item => setItems(state => state.filter(i => i.key !== item.key)),
    config: (item, state) => config,
  })

  return (
    <Container id="speechBubbles">
      {transitions.map(({ key, item, props: { ...style } }) => (
        <Message key={key} style={style}>
          <Content ref={ref => ref && refMap.set(item, ref)}>
            <p className="messages">{item.msg}</p>
          </Content>
        </Message>
      ))}
    </Container>
  )
}
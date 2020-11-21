import _ from 'lodash'
import React, { useContext } from 'react'
import { GameState, WebSocketMessageType } from 'shared/types'
import SocketContext, { createWSMessage } from '../socketUtil'
import { Card } from './Card'
import { Log } from './Log'
import { Player } from './Player'
import { RegistrationForm } from './RegistrationForm'
import './Table.css'

export const Table: React.FC = () => {
  const socketContext = useContext(SocketContext)

  const onClickListener = (type: WebSocketMessageType) => {
    socketContext.webSocket?.send(createWSMessage({ type }))
  }

  const onRaiseClickListener = (raise: number) => {
    socketContext.webSocket?.send(createWSMessage({ type: 'raise', payload: { raise } }))
  }

  return (
    <div id="table" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {!socketContext?.userId && <RegistrationForm />}
      {socketContext.gameState?.players.map((player, index, players) => {
        const angle = ((2 * Math.PI) / players.length) * index
        const baseX = Math.sin(angle)
        const baseY = Math.cos(angle)
        let x, y
        if (Math.abs(baseX) > Math.abs(baseY)) {
          const xMultiplier = 1 / Math.abs(baseX)
          x = baseX < 0 ? -1 : baseX > 0 ? 1 : 0
          y = baseY * xMultiplier
        } else {
          const yMultiplier = 1 / Math.abs(baseY)
          y = baseY < 0 ? -1 : baseY > 0 ? 1 : 0
          x = baseX * yMultiplier
        }
        return <Player key={index} player={player} x={x ?? baseX} y={y ?? baseY} />
      })}
      <div
        style={{
          width: '50%',
          height: '50%',
          background: 'lightgreen',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {socketContext.gameState?.communityCards.map((card) => (
          <Card key={`${card.rank}${card.suit}`} card={card} canShow={false} />
        ))}
        {_.times(5 - (socketContext.gameState as GameState).communityCards.length, () => (
          <div style={{ width: 100 }} />
        ))}
        <Log />
      </div>
      <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <input type="button" onClick={() => onClickListener('playerDrawCards')} value={'new round'} />
        <input type="button" onClick={() => onClickListener('flop')} value={'flop'} />
        <input type="button" onClick={() => onClickListener('turn')} value={'turn'} />
        <input type="button" onClick={() => onClickListener('river')} value={'river'} />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <input type="button" onClick={() => onRaiseClickListener(25)} value={'+25'} />
        <input type="button" onClick={() => onRaiseClickListener(100)} value={'+100'} />
        <input type="button" onClick={() => onRaiseClickListener(200)} value={'+200'} />
        <input type="button" onClick={() => onRaiseClickListener(500)} value={'+500'} />
        <input type="button" onClick={() => onRaiseClickListener(1000)} value={'+1000'} />
      </div>
    </div>
  )
}

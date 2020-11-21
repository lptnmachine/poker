import React, { MouseEventHandler, useContext } from 'react'
import { ICard } from 'shared/types'
import SocketContext, { createWSMessage } from '../socketUtil'

interface ICardProps {
  card: ICard
  canShow: boolean
}

export const Card: React.FC<ICardProps> = ({ card, canShow }) => {
  const socketContext = useContext(SocketContext)

  const clickListener: MouseEventHandler = () => {
    socketContext.webSocket?.send(createWSMessage({ type: 'revealCard', payload: { cardId: card.id } }))
  }
  return (
    <img
      src={card.rank && card.suit ? `./img/cards/${card.rank + card.suit}.png` : './img/cards/blue_back.png'}
      width={100}
      onClick={canShow ? clickListener : undefined}
      style={
        card.public
          ? { boxSizing: 'border-box', border: '2px solid orange' }
          : { boxSizing: 'border-box', border: '2px solid transparent' }
      }
    />
  )
}

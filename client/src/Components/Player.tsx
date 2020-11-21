import React from 'react'
import { IPlayer } from 'shared/types'
import { Card } from './Card'
import './Player.css'

export interface IPlayerProps {
  player: IPlayer
  x: number
  y: number
}

export const Player: React.FC<IPlayerProps> = ({ player, x, y }) => {
  const left = (x + 1) * 50
  const top = (y + 1) * 50

  const style: React.CSSProperties = {
    left: `calc(${left}% - ${(left / 100) * 200}px)`,
    top: `calc(${top}% - ${(top / 100) * 200}px)`,
  }
  if (player.isMe) {
    style['background'] = 'gold'
  }

  return (
    <div className={'player'} style={style}>
      <div>{player.name}</div>
      {player.cards.map((card) => (
        <Card card={card} key={card.id} canShow={Boolean(player.isMe)} />
      ))}
      <div>{player.bet}</div>
    </div>
  )
}

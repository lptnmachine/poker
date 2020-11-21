import ws from 'ws'

export type Suit = 'D' | 'C' | 'H' | 'S'
export type Rank = number | 'A' | 'J' | 'Q' | 'K'

export interface ICard {
  suit?: Suit
  rank?: Rank
  id?: string
  public?: boolean
}

export interface IPlayer {
  name: string
  chips: number
  cards: ICard[]
  isMe?: boolean
  state: PlayerState
  bet: number
}

export type WebSocketMessageType =
  | 'register'
  | 'fold'
  | 'newPlayer'
  | 'playerDrawCards'
  | 'stateUpdate'
  | 'revealCard'
  | 'flop'
  | 'turn'
  | 'river'
  | 'raise'

export interface WebSocketMessage {
  type: WebSocketMessageType
  payload?: { [key: string]: any }
}

export interface GameState {
  players: IPlayer[]
  communityCards: ICard[]
  log: Log[]
}

export interface Log {
  date: Date
  user: string | undefined
  entry: string
}

export interface Connection {
  player: IPlayer
  ws: ws
  id: string
}

export enum GamePhases {
  PREFLOP,
  FLOP,
  TURN,
  RIVER,
}

export enum PlayerState {
  FOLDED,
  NOT_FOLDED,
}

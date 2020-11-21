import _ from 'lodash'
import { Connection, GameState, ICard, Log, PlayerState, Rank, Suit, WebSocketMessage } from 'shared/types'
import { v4 as uuidv4 } from 'uuid'
import ws from 'ws'
import { createWSMessage } from './utils'

const baseDeck: ICard[] = (['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'] as Rank[]).flatMap((rank) =>
  (['C', 'D', 'H', 'S'] as Suit[]).map((suit) => ({ rank, suit })),
)

const getShuffledDeck = (): ICard[] => {
  const tempDeck = [...baseDeck]
  const shuffledDeck = []
  while (tempDeck.length) {
    const index = Math.floor(Math.random() * tempDeck.length)
    shuffledDeck.push({ ...tempDeck[index], id: uuidv4() })
    _.remove(tempDeck, (_item, i) => i === index)
  }
  return shuffledDeck
}

let shuffledDeck = getShuffledDeck()
const drawnCards: ICard[] = []
const revealedCardIds: string[] = []
const communityCards: ICard[] = []

const gLog: Log[] = []
const log = (userId: string, entry: string) => gLog.push({ date: new Date(), user: idToName(userId), entry })

const drawCard = (revealed = false): ICard => {
  const card = shuffledDeck.pop()
  if (!card) {
    throw new Error('no more card to draw available')
  }
  drawnCards.push(card)
  return revealed
    ? card
    : {
        id: card.id,
      }
}

const connections: Connection[] = []

const sendStateUpdate = () =>
  connections.forEach((conn) => {
    conn.ws.send(
      createWSMessage({
        type: 'stateUpdate',
        payload: {
          gameState: {
            players: connections.map((innerConn) => {
              const isMe = innerConn.id === conn.id
              return {
                ...innerConn.player,
                isMe,
                cards: innerConn.player.cards.map((card) => {
                  if (isMe && revealedCardIds.includes(card.id as string)) {
                    return { ...drawnCards.find((deckCard) => deckCard.id === card.id), public: true }
                  }
                  if (isMe || revealedCardIds.includes(card.id as string)) {
                    return drawnCards.find((deckCard) => deckCard.id === card.id)
                  }
                  return card
                }),
              }
            }),
            communityCards,
            log: gLog,
          } as GameState,
        },
      }),
    )
  })

const wss = new ws.Server({ port: 8080 })
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data: WebSocketMessage = JSON.parse(message.toString())
    switch (data.type) {
      case 'register':
        if (data.payload?.id) {
          const conn = connections.find((conn) => conn.id === data.payload?.id)
          if (conn) {
            console.log(connections)
            conn.ws = ws
          }
          break
        }

        if (data.payload?.name) {
          const name = data.payload.name
          const id = uuidv4()
          connections.push({
            id,
            ws,
            player: { name, chips: 0, cards: [], state: PlayerState.NOT_FOLDED, bet: 0 },
          })
          ws.send(createWSMessage({ type: 'register', payload: { userId: id } }))
          log(name, 'new player connected')
        }
        break

      case 'playerDrawCards':
        shuffledDeck = getShuffledDeck()
        drawnCards.length = 0
        revealedCardIds.length = 0
        communityCards.length = 0
        const updatedConnections = connections.map((conn) => ({
          ...conn,
          player: { ...conn.player, cards: [drawCard(), drawCard()] },
        }))
        connections.length = 0
        connections.push(...updatedConnections)
        log(data.payload?.userId, 'new round started')
        break

      case 'revealCard':
        const card = connections
          .find((conn) => conn.id.localeCompare(data.payload?.userId) === 0)
          ?.player.cards.find((card) => card.id === data.payload)
        if (card) {
          revealedCardIds.push(data.payload?.cardId)
          log(data.payload?.userId, `revealed a ${cardString(card)}`)
        }
        break

      case 'stateUpdate':
        break

      case 'flop':
        _.times(3, () => {
          communityCards.push(drawCard(true))
        })
        log(data.payload?.userId, `flopped ${communityCards.map((card) => cardString(card))}`)
        break

      case 'turn':
        communityCards.push(drawCard(true))
        log(data.payload?.userId, `turned ${cardString(_.last(communityCards) as ICard)}`)
        break

      case 'river':
        communityCards.push(drawCard(true))
        log(data.payload?.userId, `river'd ${cardString(_.last(communityCards) as ICard)}`)
        break

      case 'raise':
        const player = getPlayerFromId(data.payload?.userId)
        console.log(data.payload)
        if (player) {
          player.bet += parseInt(data.payload?.raise)
        }
        break
    }
    sendStateUpdate()
  })
})

const getPlayerFromId = (id: string) => connections.find((conn) => conn.id === id)?.player

const cardString = (card: ICard) => `${suitToChar[card.suit as Suit]}${card.rank}`

const suitToChar = {
  D: '♦',
  C: '♣',
  H: '♥',
  S: '♠',
}

const idToName = (pid: string) => connections.find(({ id }) => id === pid)?.player.name

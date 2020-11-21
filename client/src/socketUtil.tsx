import React, { useEffect, useState } from 'react'
import { GameState, WebSocketMessage } from 'shared/types'

const SocketContext = React.createContext<{
  webSocket?: WebSocket
  userId?: string
  setUserId?: (userId: string) => void
  gameState?: GameState
}>({
  webSocket: undefined,
  userId: undefined,
  setUserId: undefined,
  gameState: undefined,
})

const gWebSocket = new WebSocket('ws://localhost:8080')

let gUserId: string

export const SocketProvider: React.FC = ({ children }) => {
  const [userId, setUserId] = useState<string>()
  const [webSocket] = useState<WebSocket>(gWebSocket)
  const [gameState, setGameState] = useState<GameState>({ players: [], communityCards: [], log: [] })

  useEffect(() => {
    webSocket.onopen = () => {
      console.log('ws open')
      if (document.cookie) {
        const userId = document.cookie.split('=')[1]
        setUserId(userId)
        webSocket.send(createWSMessage({ type: 'register', payload: { id: userId } }))
      }
    }

    webSocket.onmessage = (e) => {
      console.log(e.data)
      const data: WebSocketMessage = JSON.parse(e.data)
      switch (data.type) {
        case 'register':
          setUserId(data.payload?.userId)
          document.cookie = `id=${data.payload}`
          break
        case 'stateUpdate':
          setGameState(data.payload?.gameState)
          break
        case 'fold':
          break
      }
    }
  }, [gameState])

  useEffect(() => {
    gUserId = userId as string
  }, [userId])

  return <SocketContext.Provider value={{ userId, setUserId, webSocket, gameState }}>{children}</SocketContext.Provider>
}

export const createWSMessage = (message: WebSocketMessage): string =>
  JSON.stringify({ ...message, payload: { ...message.payload, userId: gUserId } })

export default SocketContext

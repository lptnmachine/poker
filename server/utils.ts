import { WebSocketMessage } from 'shared/types'

export const createWSMessage = (message: WebSocketMessage): string => JSON.stringify(message)

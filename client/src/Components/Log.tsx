import React, { useContext } from 'react'
import SocketContext from '../socketUtil'

export const Log: React.FC = () => {
  const socketContext = useContext(SocketContext)

  return (
    <div style={{ width: '40%', height: '100%', maxHeight: '100%', overflowY: 'scroll' }}>
      <table>
        <tbody>
          {socketContext.gameState?.log
            ?.map((log, i) => (
              <tr key={i}>
                <td>{new Date(log.date).toLocaleTimeString()}</td>
                <td>{log.user}</td>
                <td>{log.entry}</td>
              </tr>
            ))
            .reverse()}
        </tbody>
      </table>
    </div>
  )
}

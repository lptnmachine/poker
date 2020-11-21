import React, { MouseEventHandler, useContext } from 'react'
import SocketContext, { createWSMessage } from '../socketUtil'

export const RegistrationForm: React.FC = () => {
  const webSocket = useContext(SocketContext)
  const onClickListener: MouseEventHandler = (e) => {
    webSocket.webSocket?.send(
      createWSMessage({
        type: 'register',
        payload: { name: (document.querySelector('#nameInput') as HTMLInputElement)?.value },
      }),
    )
  }

  return (
    <div style={{ width: '50%', height: '50%', position: 'absolute', background: 'white', zIndex: 100 }}>
      <input type="text" id="nameInput" />
      <input type="button" value="Start" onClick={onClickListener} />
    </div>
  )
}

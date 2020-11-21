import React from 'react'
import './App.css'
import { Table } from './Components/Table'
import { SocketProvider } from './socketUtil'

export const App: React.FC = () => {
  return (
    <SocketProvider>
      <Table />
    </SocketProvider>
  )
}

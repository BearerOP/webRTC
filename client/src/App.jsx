import './App.css'
import { Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import { SocketProvider } from './context/SocketContext'
import RoomPage from './pages/Roompage'
import { PeerProvider } from './context/PeerContext'

function App() {
  return (
    <SocketProvider>
      <PeerProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/room/:roomCode" element={<RoomPage />} />
      </Routes>
      </PeerProvider>
    </SocketProvider>
  )
}

export default App

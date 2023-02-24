import * as net from 'net'
import Buffer from 'buffer'
import tracker from './tracker'

export default (torrent) => {
  tracker.getPeers(torrent, peers => {
    peers.forEach(download)
  })
}

const download = (peer) => {
  const socket = net.socket()
  socket.on('error', console.log)
  socket.connect(peer.port, peer.ip, () => {

  })
  socket.on('data', data => {

  })
}

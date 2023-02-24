'use strict'

import dgram from 'dgram'
import { Buffer } from 'buffer'
import { URL as UrlParse } from 'url'
import crypto from 'crypto'
import * as torrentParser from './torrentParser.js'

export const getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4')
  const url = 'udp://tracker.opentrackr.org:1337/announce'

  // 1. send connect request
  console.log('1', torrent)
  socket.on('listening', () => console.log('listening'))
  socket.on('message', response => {
    console.log('2', response)
    if (respType(response) === 'connect') {
      // 2. receive and parse connect response
      const connResp = parseConnResp(response)
      console.log('connResp', connResp)
      // 3. send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId, torrent)

      udpSend(socket, announceReq, url)
    } else if (respType(response) === 'announce') {
      // 4. parse announce response
      const announceResp = parseAnnounceResp(response)
      console.log('announceResp', announceResp)
      // 5. pass peers to callback
      callback(announceResp.peers)
    }
  })
  udpSend(socket, buildConnReq(), url)
}

function udpSend(socket, message, rawUrl, callback = () => { }) {
  const url = new UrlParse(rawUrl)
  console.log(message)
  socket.send(message, 0, message.length, url.port, url.hostname, callback)
}

// check response type
function respType(resp) {
  const action = resp.readUInt32BE(0)
  if (action === 0) return 'connect'
  if (action === 1) return 'announce'
}

function buildConnReq() {
  const buf = Buffer.alloc(16)

  buf.writeUInt32BE(0x417, 0)
  buf.writeUInt32BE(0x27101980, 4)
  buf.writeUInt32BE(0, 8)

  crypto.randomBytes(4).copy(buf, 12)

  return buf
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8)
  }
}

function buildAnnounceReq(connId, torrent, port = 6881) {
  const buf = Buffer.allocUnsafe(98)
  connId.copy(buf, 0)
  buf.writeUInt32BE(1, 8)
  crypto.randomBytes(4).copy(buf, 12)
  console.log('torrent', torrent)
  torrentParser.infoHash(torrent).copy(buf, 16)
  Buffer.alloc(8).copy(buf, 36)
  Buffer.alloc(8).copy(buf, 72)
  buf.writeUInt32BE(0, 80)
  buf.writeUInt32BE(0, 80)
  crypto.randomBytes(4).copy(buf, 88)
  buf.writeInt32BE(-1, 92)
  buf.writeUInt16BE(port, 96)
  return buf
}

function parseAnnounceResp(resp) {
  const group = (iterable, groupSize) => {
    const groups = []
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize))
    }
    return groups
  }
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map(address => {
      return {
        id: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      }
    })
  }
}

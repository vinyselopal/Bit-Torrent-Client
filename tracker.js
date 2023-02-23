'use strict';

import dgram from 'dgram'
import {Buffer} from 'buffer'
import {parse as urlParse} from 'url'
import crypto from 'crypto'
import torrentParser from './torrent-parser'
import util from './util'
export const getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4');
  const url = "udp://tracker.coppersurfer.tk:6969/announce";

  // 1. send connect request
  console.log('1')
  socket.on('listening', () => console.log('listening'))
  socket.on('message', response => {
    console.log('2')
    if (respType(response) === 'connect') {
      // 2. receive and parse connect response
      const connResp = parseConnResp(response);
      // 3. send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId);
      udpSend(socket, announceReq, url);
    } else if (respType(response) === 'announce') {
      // 4. parse announce response
      const announceResp = parseAnnounceResp(response);
      // 5. pass peers to callback
      callback(announceResp.peers);
    }

  });
  udpSend(socket, buildConnReq(), url);

};

function udpSend(socket, message, rawUrl, callback=()=>{}) {
  const url = urlParse(rawUrl);
  console.log(message)
  socket.send(message, 0, message.length, url.port, url.hostname, callback);

}

function respType(resp) {
  // ...
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

function buildAnnounceReq(connId, torrent, port=6881) {
  const buf = Buffer.allocUnsafe(98)
  connId.copy(buf, 0)
  buf.writeUInt32BE(1, 8)
  crypto.randomBytes(4).copy(buf, 12)
  torrentParser.infoHash(torrent).copy(buf, 16)
  Buffer.alloc(8).copy(buf, 36)
  Buffer.alloc(8). copy(buf, 72)
  buf.writeUInt32BE(0, 80)
  buf.writeUInt32BE(0, 80)
  crypto.randomBytes(4).copy(buf, 88)
  buf.writeInt32BE(-1, 92)
  buf.writeUInt16BE(port, 96)
  return buf
}

function parseAnnounceResp(resp) {
  // ...
}
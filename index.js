'use strict'

import fs from 'fs'
import jschardet from 'jschardet'
import bencode from 'bencode'
import * as tracker from './tracker.js'
import iconvlite from 'iconv-lite'

 async function main () {
    const buffer = fs.readFileSync('example.torrent')
    // const torrent = bencode.decode(buffer, null)
    const torrent = ''
    tracker.getPeers(torrent, peers => {
        console.log('list of peers', peers)
    })
}

main()



'use strict'

import fs from 'fs'
import jschardet from 'jschardet'
import bencode from 'bencode'
import * as tracker from './src/tracker.js'
import iconvlite from 'iconv-lite'

import download from './src/download'
import torrentParser from './src/torrentParser'

const torrent = torrentParser.open(process.argv[2])

download(torrent)

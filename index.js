'use strict'

import download from './src/download'
import torrentParser from './src/torrentParser'

const torrent = torrentParser.open(process.argv[2])

download(torrent)

const fs = require('fs')
const bencode = require('bencode')

export const open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath))
}

export const size = (torrent) => {

}

export const infoHash = (torrent) => {
    
}
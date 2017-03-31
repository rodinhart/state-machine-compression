"use strict"

// Imports.
const util = require("./util.js")

// decode :: Decoding -> Buffer -> Buffer
const decode = (decoding, codes) => {
  var b, bit, buf, byte, c, state

  buf = Buffer.alloc(10 * codes.length)
  state = codes.readUInt16LE(0)
  bit = codes.readUInt8(2)
  byte = codes.readUInt8(3)
  c = 4
  b = 0
  while (codes.length - c > 0 || state !== decoding.length) {
    buf.writeUInt8(decoding[state - decoding.length][0], b++)
    state = decoding[state - decoding.length][1]
    while (state < decoding.length) {
      if (bit === 0) {
        byte = codes.readUInt8(c++)
        bit = 8
      }

      state = (state << 1) + (byte & 1)
      byte = byte >>> 1
      bit--
    }
  }

  return buf.slice(0, b)
}

// decompress :: Buffer -> Buffer
const decompress = source => {
  var data, i, raw

  data = []
  for (i = 0; i < util.S; i++) {
    data[i] = source.readUInt32LE(4 * i)
  }

  const decoding = util.getDecoding({ data: data })
  const encoding = util.getEncoding(decoding)

  raw = source.slice(4 * util.S)

  return decode(decoding, raw)
}

// main
util.readStdin(source => util.writeStdout(decompress(source)))

"use strict"

// Imports.
const util = require("./util.js")

// decode :: Decoding -> Buffer -> Buffer
const decode = (decoding, codes) => {
  const L = decoding.length

  var b, bit, buf, byte, c, state

  buf = Buffer.alloc(10 * codes.length)
  state = codes.readUInt16LE(0)
  bit = codes.readUInt8(2)
  byte = codes.readUInt8(3)
  c = 4
  b = 0
  while (codes.length - c > 0 || state !== L) {
    buf.writeUInt8(decoding[state - L][0], b++)
    state = decoding[state - L][1]
    while (state < L) {
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
  var hist, i

  hist = new Array(util.S)
  for (i = 0; i < hist.length; i += 2) {
    hist[i] = (source[1.5 * i] | (source[1.5 * i + 1] << 8)) & 0xFFF
    hist[i + 1] = (source[1.5 * i + 1] >> 4) | (source[1.5 * i + 2] << 4)
  }

  const decoding = util.getDecoding(hist)
  const encoding = util.getEncoding(decoding)

  return decode(decoding, source.slice(1.5 * hist.length))
}

// main
util.readStdin(source => util.writeStdout(decompress(source)))

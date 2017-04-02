"use strict"

// Imports.
const util = require("./util.js")

// decode :: [(Number, Number)] -> Buffer -> Buffer
const decode = (decoding, codes) => {
  const L = decoding.length

  var bits, buf, pCode, pTar, state, target

  state = codes[0] | (codes[1] << 8)
  bits = codes[2]
  buf = codes[3]

  target = Buffer.alloc(10 * codes.length)
  pCode = 4
  pTar = 0
  while (codes.length - pCode > 0 || state !== L) {
    target[pTar++] = decoding[state - L][0]
    state = decoding[state - L][1]
    while (state < L) {
      if (bits === 0) {
        buf = codes[pCode++]
        bits = 8
      }

      state = (state << 1) + (buf & 1)
      buf = buf >>> 1
      bits--
    }
  }

  return target.slice(0, pTar)
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

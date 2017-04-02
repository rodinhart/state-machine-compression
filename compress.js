"use strict"

// Imports.
const util = require("./util.js")

// compress :: Buffer -> Buffer
const compress = source => {
  var i, raw, target

  const hist = util.getHistogram(source)
  const decoding = util.getDecoding(hist)
  const encoding = util.getEncoding(decoding)

  raw = encode(encoding, source)
  console.error("Raw: " + util.formatSize(raw.length))

  target = Buffer.alloc(1.5 * hist.length + raw.length)
  for (i = 0; i < hist.length; i += 2) {
    target[1.5 * i] = hist[i]
    target[1.5 * i + 1] = (hist[i] | (hist[i + 1] << 12)) >> 8
    target[1.5 * i + 2] = hist[i + 1] >> 4
  }

  raw.copy(target, 1.5 * hist.length)

  return target
}

// encode :: [[Number]] -> Buffer -> Buffer
const encode = (encoding, source) => {
  const L = encoding.length

  var bits, buf, codes, pCode, pSou, state

  codes = Buffer.alloc(source.length) // can't grow
  pCode = codes.length
  buf = 0
  bits = 0
  state = encoding.length
  for (pSou = source.length - 1; pSou >= 0; pSou--) {
    state = encoding[state - L][source[pSou]]
    while (state >= 2 * L) {
      buf = (buf << 1) | (state & 1)
      bits++
      if (bits === 8) {
        codes[--pCode] = buf // check underflow
        buf = 0
        bits = 0
      }

      state = state >>> 1
    }
  }

  codes[pCode - 4] = state
  codes[pCode - 3] = state >> 8
  codes[pCode - 2] = bits
  codes[pCode - 1] = buf
  
  return codes.slice(pCode - 4)
}

// main
util.readStdin(source => util.writeStdout(compress(source)))

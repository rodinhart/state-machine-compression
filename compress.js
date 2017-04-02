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

// encode :: Encoding -> Buffer -> Buffer
const encode = (encoding, file) => {
  const L = encoding.length

  var b, bit, buf, byte, c, i, state

  buf = Buffer.alloc(file.length) // can't grow
  b = buf.length
  byte = 0
  bit = 0
  state = encoding.length
  for (i = file.length - 1; i >= 0; i--) {
    c = file[i]
    state = encoding[state - L][c]
    while (state >= 2 * L) {
      byte = (byte << 1) | (state & 1)
      bit++
      if (bit === 8) {
        buf.writeUInt8(byte, --b) // check underflow
        byte = 0
        bit = 0
      }

      state = state >>> 1
    }
  }

  buf.writeUInt16LE(state, b - 4)
  buf.writeUInt8(bit, b - 2)
  buf.writeUInt8(byte, b - 1)
  
  return buf.slice(b - 4)
}

// main
util.readStdin(source => util.writeStdout(compress(source)))

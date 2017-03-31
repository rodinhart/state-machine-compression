"use strict"

// Imports.
const util = require("./util.js")

// compress :: Buffer -> Buffer
const compress = source => {
  var raw, target

  const hist = util.getHistogram(source)
  const decoding = util.getDecoding(hist)
  const encoding = util.getEncoding(decoding)

  raw = encode(encoding, source)
  console.error("Raw: " + util.formatSize(raw.length))

  target = Buffer.alloc(4 * hist.length + raw.length)
  hist.forEach((count, index) => {
    target.writeUInt32LE(count, 4 * index)
  })
  
  raw.copy(target, 4 * hist.length)

  return target
}

// encode :: Encoding -> Buffer -> Buffer
const encode = (encoding, file) => {
  const L = encoding.length

  var b, bit, buf, byte, c, i, result, state

  buf = Buffer.alloc(file.length)
  b = 0
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
        buf.writeUInt8(byte, b++) // check overflow
        byte = 0
        bit = 0
      }

      state = state >>> 1
    }
  }

  result = Buffer.alloc(2 + 1 + 1 + b)
  result.writeUInt16LE(state, 0)
  result.writeUInt8(bit, 2)
  result.writeUInt8(byte, 3)

  for (i = 0; i < b; i++) {
    result.writeUInt8(buf.readUInt8(i), result.length - 1 - i)
  }
  
  return result
}

// main
util.readStdin(source => util.writeStdout(compress(source)))

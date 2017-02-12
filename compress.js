"use strict"

const fs = require("fs")

console.log("Reading file...")
const source = fs.readFileSync("compress.js")
console.log("Source length: " + source.length)

var hist, i, max, symbol

console.log("Building histogram...")
hist = []
for (i = 0; i < 256; i++) hist[i] = 0

max = 0
for (i = 0; i < source.length; i++) {
  symbol = source[i]
  hist[symbol]++
  if (hist[symbol] > max) max = hist[symbol]
}

for (i = 0; i < 256; i++) {
  hist[i] = hist[i] !== 0 ? Math.round(max / hist[i]) : 0
}

var free, table

console.log("Building table...")
table = new Array(4096)
for (i = 0; i < table.length; i++) table[i] = []

free = 1
for (i = 0; i < table.length; i++) {
  for (symbol = 0; symbol < 256; symbol++) {
    if (free >= table.length) break
    if (hist[symbol] !== 0 && (i % hist[symbol]) === 0) {
      table[free][256] = i
      table[free][257] = symbol
      table[i][symbol] = free++
    }
  }
}

var buffer, state

console.log("Encoding...")
buffer = []
state = 0 // never output as code?
for (i = 0; i < source.length; i++) {
  symbol = source[i]
  if (table[state][symbol] === undefined) {
    buffer.push(state) // 12 bits!
    state = 0
  }

  state = table[state][symbol]
}

if (state !== 0) buffer.push(state) // 12 bits

console.log("Target length: " + (buffer.length * 1.5))

var copy

console.log("Decoding...")
copy = []
for (i = 0; i < buffer.length; i++) {
  state = buffer[i]
  while (true) {
    if (table[state][256] === undefined) break
    copy.push(table[state][257])
    state = table[state][256]
  }
}

console.log("Copy length: " + copy.length)
fs.writeFileSync("copy.txt", Buffer.from(copy))

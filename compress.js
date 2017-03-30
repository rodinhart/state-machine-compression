"use strict"

const fs = require("fs")
const kb = x => x + " bytes"//Math.round(x / 1000) + "Kb"

console.log("Reading file...")
const source = fs.readFileSync("./CanvasTest.html")
console.log("Source length: " + kb(source.length))

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

console.log("Optimal: " + kb(hist.reduce((a, x) =>
  a + (x !== 0 ? x * Math.log(source.length / x) / Math.log(2) : 0),
  0) / 8))

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

console.log("Target length: " + kb(buffer.length * 1.5))

var copy, t, tmp

console.log("Decoding...")
copy = []
for (i = 0; i < buffer.length; i++) {
  state = buffer[i]
  tmp = []
  while (true) {
    if (table[state][256] === undefined) break
    tmp.unshift(table[state][257])
    state = table[state][256]
  }

  for (t = 0; t < tmp.length; t++) {
    copy.push(tmp[t])
  }
}

console.log("Copy length: " + kb(copy.length))
fs.writeFileSync("./_copy.html", Buffer.from(copy))

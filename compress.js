"use strict"

const fs = require("fs")

const source = fs.readFileSync("compress.js")

var hist, i, max, symbol

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
table = new Array(4096)
for (i = 0; i < table.length; i++) table[i] = []

free = 1
for (i = 0; i < 4096; i++) {
  for (symbol = 0; symbol < 256; symbol++) {
    if (free < table.length && symbol[hist] !== 0 && (symbol % hist[symbol]) === 0) {
      table[free][256] = i
      table[free][257] = symbol
      table[i][symbol] = free++
    }
  }
}

for (i = 0; i < table.length; i++) {
  console.log(table[i].map(x => x === undefined ? " " : ("  " + x).substr(-3)).join(" "))
}

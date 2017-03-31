state-machine-compression

```js
"use strict"

```
Imports.
```js
const fs = require("fs")
const kb = x => x + " bytes"// Math.round(x / 1000) + "Kb"

```
L :: Number
```js
const L = 4096

```
S :: Number
```js
const S = 256

```
compress :: Encoding -> String -> [Number]
```js
const compress = (encoding, file) => {
  var bits, c, i, state

  bits = []
  state = L
  for (i = file.length - 1; i >= 0; i--) {
    c = file[i]
    state = encoding[state - L][c]
    while (state >= 2 * L) {
      bits.push(state & 1)
      state = state >>> 1
    }
  }

  bits.push(state)

  return bits
}

```
decompress :: Decoding -> [Number] -> String
```js
const decompress = (decoding, codes) => {
  var file, state

  file = ""
  state = codes.pop()
  while (codes.length > 0 || state !== L) {
    file = file + String.fromCharCode(decoding[state - L][0])
    state = decoding[state - L][1]
    while (state < L) {
      state = (state << 1) + codes.pop()
    }
  }

  return file
}

```
getEncoding :: Decoding -> Encoding
```js
const getEncoding = decoding => {
  var c, i, m, s, t, table

  table = []
  for (i = 0; i < L; i++) {
    table[i] = []
  }

  for (i = 0; i < L; i++) {
    c = decoding[i][0]
    s = decoding[i][1]
    t = 1
    while (s < L) {
      s = s << 1
      t = t << 1
    }

    m = t
    while (t > 0) {
      table[s - L][c] = (i + L) * m + m - t
      s++
      t--
    }
  }

  return table
}

```
getDecoding :: Histogram -> String -> Decoding
```js
const getDecoding = (hist, file) => {
  var data, c, i, l, table

  data = (() => {
    var best, c, f, t, total

    total = 0
    data = hist.data.map(c => {
      var f, r

      if (c === 0) return [0, 0]

      f = 1 + Math.floor((L - hist.count) * c / file.length)
      r = Math.round(f)
      total += r

      return [r, f]
    })

    while (total < L) {
      best = 0
      f = data[0][1] - data[0][0]
      for (c = 1; c < data.length; c++) {
        t = data[c][1] - data[c][0]
        if (t > f) {
          best = c;
          f = t
        }
      }

      data[best] = [data[best][0] + 1, data[best][0] + 1]
      total++
    }

    return data.map(e => e[0])
  })()

  table = []
  for (c = 0; c < data.length; c++) {
    l = data[c]
    i = l
    while (i < 2 * l) {
      table.push([c, i])
      i++
    }
  }

  if (table.length !== L) throw new Error("Decoding table not the righ length")

  return table
}

```
getHistogram :: String -> Histogram
```js
const getHistogram = file => {
  var c, count, hist, i, max
  
  hist = []
  for (i = 0; i < S; i++) {
    hist[i] = 0
  }

  count = max = 0
  for (i = 0; i < file.length; i++) {
    c = file[i]
    if (hist[c] === 0) count++
    hist[c]++
    if (hist[c] > max) max = hist[c]
  }

  return {
    count: count,
    data: hist,
    max: max
  }
}

```
getOptimal :: Histogram -> Number
```js
const getOptimal = hist => hist.data.reduce((a, x) =>
  a + (x !== 0 ? x * Math.log2(source.length / x) : 0),
  0
) / 8


```
App
```js
const source = fs.readFileSync("./CanvasTest.html")
console.log("Source: " + kb(source.length))

const hist = getHistogram(source)
console.log("Optimal: " + kb(getOptimal(hist)))

const decoding = getDecoding(hist, source)
const encoding = getEncoding(decoding)

const target = compress(encoding, source)
console.log("Target: " + kb(target.length / 8))

const copy = decompress(decoding, target)
console.log("Copy: " + kb(copy.length))
fs.writeFileSync("./_copy.html", copy)

```
Exports.
```js
module.exports = {
  decode: null,
  encode: null
}

```
------------------------
Generated _Fri Mar 31 2017 08:25:13 GMT+0100 (GMT Summer Time)_ from [&#x24C8; index.js](index.js "View in source")


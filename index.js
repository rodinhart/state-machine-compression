// state-machine-compression

"use strict"

// Imports.
const fs = require("fs")
const kb = x => x + " bytes"// Math.round(x / 1000) + "Kb"

// L :: Number
const L = 4096

// S :: Number
const S = 256


// App
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

// Exports.
module.exports = {
  decode: null,
  encode: null
}

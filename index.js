"use strict"

const N = undefined
const table = [
  [1, 7, N, N],
  [2, N, 0, 0],
  [3, N, 1, 0],
  [4, N, 2, 0],
  [5, N, 3, 0],
  [6, N, 4, 0],
  [N, N, 5, 0],
  [N, N, 0, 1]
]

const src = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
console.log()
console.log(src)
console.log("src length: " + src.length + " bits")
const histo = [0, 0]
src.forEach(x => histo[x]++)
console.log("histo " + histo.join(", "))
console.log("optimum " + histo.reduce((a, x) => a + x * Math.log(src.length / x) / Math.log(2), 0))

// encode
var state, s, tar

tar = []
state = 0
for (s = 0; s < src.length; s++) {
  if (table[state][src[s]] === undefined) {
    tar.push(state)
    state = 0
  }

  state = table[state][src[s]]
}

if (state !== 0) tar.push(state)

console.log()
console.log(tar)
console.log("tar length: " + (3 * tar.length))

// decode
var cpy

cpy = []
for (s = 0; s < tar.length; s++) {
  state = tar[s]
  while (true) {
    if (table[state][2] === N) break
    cpy.push(table[state][3])
    state = table[state][2]
  }
}

console.log()
console.log(cpy)
console.log("cpy length: " + cpy.length)

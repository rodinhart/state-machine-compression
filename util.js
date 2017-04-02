"use strict"

const S = 256
const L = 4096

//  formatSize :: Number -> String
const formatSize = size => Math.ceil(size) + " bytes"

// getDecoding :: Histogram -> [(Number, Number)]
const getDecoding = hist => {
  var count, decoding, state, symbol

  decoding = []
  for (symbol = 0; symbol < hist.length; symbol++) {
    count = hist[symbol]
    for (state = count; state < 2 * count; state++) decoding.push([symbol, state])
  }

  return decoding
}

// getEncoding :: [(Number, Number)] -> [[Number]]
const getEncoding = decoding => {
  const L = decoding.length

  var encoding, i, m, prime, state, symbol

  encoding = []
  for (i = 0; i < L; i++) {
    encoding[i] = []
  }

  for (i = 0; i < L; i++) {
    [symbol, state] = decoding[i]
    m = 1
    while (state < L) {
      state = state << 1
      m = m << 1
    }

    prime = (i + L) * m
    while (m > 0) {
      encoding[state - L][symbol] = prime
      state++
      prime++
      m--
    }
  }

  return encoding
}

// getHistogram :: Buffer -> [Number]
const getHistogram = file => {
  var c, count, hist, i
  
  hist = []
  for (i = 0; i < S; i++) {
    hist[i] = 0
  }

  count = 0
  for (i = 0; i < file.length; i++) {
    c = file[i]
    if (hist[c] === 0) count++
    hist[c]++
  }

  console.error("Optimal: " + formatSize(getOptimal(hist, file.length)))

  hist = (() => {
    var best, c, data, f, t, total

    total = 0
    data = hist.map(c => {
      var f, r

      if (c === 0) return [0, 0]

      f = 1 + Math.floor((L - count) * c / file.length)
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

  return hist
}

// getOptimal :: Histogram -> Number -> Number
const getOptimal = (hist, length) => hist.reduce((a, x) =>
  a + (x !== 0 ? x * Math.log2(length / x) : 0),
  0
) / 8

// readStdin :: (Buffer -> ()) -> ()
const readStdin = ret => {
  var buffer = Buffer.alloc(0)

  process.stdin.on("readable", () => {
    var chunk, tmp
    
    chunk = process.stdin.read()
    if (chunk) {
      tmp = Buffer.alloc(buffer.length + chunk.length, 0, "utf-8")
      buffer.copy(tmp, 0)
      chunk.copy(tmp, buffer.length)
      buffer = tmp
    }
  })

  process.stdin.on("end", () => {
    ret(buffer)
  })
}

// writeStdout :: Buffer -> ()
const writeStdout = bytes => {
  process.stdout.write(bytes)
}

// Exports.
module.exports = {
  L: L,
  S: S,
  formatSize: formatSize,
  getDecoding: getDecoding,
  getEncoding: getEncoding,
  getHistogram: getHistogram,
  getOptimal: getOptimal,
  readStdin: readStdin,
  writeStdout: writeStdout
}

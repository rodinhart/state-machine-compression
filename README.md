# state-machine-compression

I have been trying to make sense of the [paper][1] *Lightweight compression with encryption based on Asymmetric Numeral System* by Jarek Duda, but I lack the mathematical background in this area to fully understand it. So I decided to attack it from the other end and code a working compressor and decompressor to help understand this compression scheme.

## Usuage
```
node compress.js < example.txt > result.smc
```

```
node decompress.js < result.smc > _copy.txt
```

## Explanation

For illustration, consider the following data source.
```
AAABAAA
```

It has a length of 7, and the only possible symbols are `A` and `B`. We can construct a histogram.

Symbol | N
:---: | :---:
A | 5
B | 1

Now we need to set the number of codes used in the target, for this example we set `L = 4`. With this we need to normalise the histogram so the total occurrence is `L`.

Symbol | n
:---: | :---:
A | 3
B | 1

Care must be taken that any symbol occuring in the source has at least 1 occurence in the normalised histogram, otherwise it cannot be encoded.

Next step is to construct the decoding table (yes, decoding table first). For each symbol we place `n` entries in the decoding table, numbered between `n` (inclusive) and `2n` (exclusive). Each entry in the table transitions the state by outputting a symbol and taking in code bits if needed. The state is number from `L` to `2L`.

State | Symbol | New
:---: | :---: | :---:
4 | A | 3
5 | A | 4
6 | A | 5
7 | B | 1

For example, if the current state is `4`, we output an `A` and set the new state to `3`. Now, `3` is not between the range `L` and `2L` so we will shift in a bit from the compressed stream, given us either `6` or `7`. This is in range so we can decode the next symbol. Otherwise we shift in another bit until we are in range.

For a more complete example, our initial state is `6` and our compressed bits are `1`, `0`, `0`, and `0`.

State | Output | New | Input
:---: | :---: | :---: | :---
6 | A | 5
5 | A | 4
4 | A | 3 | 1
7 | B | 1 | 0 0
4 | A | 3 | 0
6 | A | 5
5 | A | 4

And we get back the original source `AAABAAA`. The size of the original is 7 bits, the compressed is 6 (2 bits for the final state, and 4 more bits).

Looking at the decoding table, we can see the compression comes about because less frequent symbols end up in lower states, and therefore require more bits to get back into range.

(coding)

State | A | B
:---: | :---: | :---:
4 | 5 | 28
5 | 6 | 29
6 | 8 | 30
7 | 9 | 31

State | Input | New | Output
:---: | :---: | :---: | :---
4 | A | 5
5 | A | 6
6 | A | 8 | 0
4 | B | 28 | 0 0
7 | A | 9 | 1
4 | A | 5
5 | A | 6

[1]: https://arxiv.org/pdf/1612.04662.pdf

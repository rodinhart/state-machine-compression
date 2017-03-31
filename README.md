# state-machine-compression

I have been trying to make sense of the [paper][1] *Lightweight compression with encryption based on Asymmetric Numeral System* by Jarek Duda, but I lack the mathematical background in this area to fully understand it. So I decided to attack it from the other end and code a working compressor and decompressor to help understand this compression scheme.

## Usage
The following commands will compress and decompress using the standard IO. Note that currently no bounds checking or error handling is performed, so it might fail with files that cannot be compressed at all, or compress insanely well.

```
node compress.js < example.txt > result.smc

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
A | 6
B | 1
total | 7

Now we need to set the number of codes used in the target, for this example we set `L = 4`. With this we need to normalise the histogram so the total occurrence is `L`.

Symbol | n
:---: | :---:
A | 3
B | 1
total | 4

Care must be taken that any symbol occuring in the source has at least 1 occurence in the normalised histogram, otherwise it cannot be encoded.

### Decoding

Next step is to construct the decoding table (yes, *decoding* table first). For each symbol we place `n` entries in the decoding table, numbered between `n` (inclusive) and `2n` (exclusive). Each entry in the table transitions the state by outputting a symbol and taking in code bits if needed. The state is numbered from `L` to `2L`.

State | Symbol | New
:---: | :---: | :---:
4 | A | 3
5 | A | 4
6 | A | 5
7 | B | 1

For example, if the current state is `4`, we output an `A` and set the new state to `3`. Now, `3` is not between `L` and `2L` so we will left-shift in a bit from the compressed stream, given us either `6` or `7`. This is in range so we can decode the next symbol. Otherwise we shift in another bit until we are in range.

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

### Encoding

To reverse the process we need the encoding table. For state transitions not involving shifting bits we can read them directly from the decoding table. These go back from `4` to `5`, and from `5` to `6`, both encoding `A`.

State | A | B
:---: | :---: | :---:
4 | 5
5 | 6
6 |
7 |

In other words, starting from state `4` encoding `A` results in new state `5`. Now let us have a look at the very first row in the decoding table. How could we transition from `3` to `4` encoding `A`? Remember that `3` is not in range so bits must have been right-shifted out. In this case it involves 1 bit (to get `3` between `L` and `2L`). The two transitions are from `6` to `8`, shifting out `0`, or from `7` to `9`, shifting out `1`. Updating our table.

State | A | B
:---: | :---: | :---:
4 | 5
5 | 6
6 | 8
7 | 9

Finally the last row, involving `B` we need to go from `1` to `7`, involving 2 bits. The four transitions are `4` to `28`, `5` to `29`, `6` to `30` and `7` to `31`. This completes the table.

State | A | B
:---: | :---: | :---:
4 | 5 | 28
5 | 6 | 29
6 | 8 | 30
7 | 9 | 31

In other words, starting from state `5` encoding `B` results in new state `29`. To get back into range we shift out `1` to get `14`, and then `0` to get `7`.

With our encoding table, let us encode `AAABAAA`, starting with state `4`.

State | Input | New | Output
:---: | :---: | :---: | :---
4 | A | 5
5 | A | 6
6 | A | 8 | 0
4 | B | 28 | 0 0
7 | A | 9 | 1
4 | A | 5
5 | A | 6

Our compressed stream is therefore final state `6`, and the bits `1`, `0`, `0` and `0`. Note that the bits are produced in the opposite order they are consumed. But also, the symbols are in reverse, so best encode back-to-front.

## Full system

The full system works exactly like this, with 256 symbols (a byte) and `L = 4096` (12 bits). In order to build the decoding and encoding tables when decompressing we also need the histogram stored in the compressed file.

[1]: https://arxiv.org/pdf/1612.04662.pdf

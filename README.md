# state-machine-compression

I have been trying to make sense of the [paper][1] *Lightweight compression with encryption based on Asymmetric Numeral System* by Jarek Duda, but I lack the mathematical background in this area to fully understand it. So I decided to attack it from the other end and code a working compressor and decompressor to help understand this compression scheme.

## Result
```
node compress.js < example.txt > result.smc
```

```
node decompress.js < result.smc > _copy.txt
```

## Concepts

For illustration, consider the following data source.
```
AABAAA
```

It has a length of 6, and the only possible symbols are `A` and `B`. We can construct a histogram.

Symbol | Occurence
:---: | ---:
A | 5
B | 1





[1]: https://arxiv.org/pdf/1612.04662.pdf

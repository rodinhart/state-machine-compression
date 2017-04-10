#include <stdio.h>

// data Bool = False | True
typedef enum { False, True } Bool;

// data File = File {
//   bytes :: Char *,
//   end :: Char *
// }
typedef struct {
  char *bytes;
  char *end;
} File;

// read :: File -> File
File read(File file) {
  char *ptr;
  int symbol;

  ptr = file.bytes;
  while ((symbol = getchar()) != EOF) *(ptr++) = symbol;

  file.end = ptr;

  return file;
}

// data Node = Node {
//   count :: Int,
//   left :: Node,
//   right :: Node,
//   symbol :: int
// }
typedef struct node {
  int count;
  struct node *left;
  struct node *right;
  int symbol;
} Node;

// histogram :: File -> [Node] -> [Node]
Node *histogram(File file, Node *hist) {
  int symbol;
  char *ptr;

  for (symbol = 0; symbol < 512; symbol++) {
    hist[symbol].count = 0;
    hist[symbol].left = NULL;
    hist[symbol].right = NULL;
    hist[symbol].symbol = symbol;
  }

  ptr = file.bytes;
  while (ptr < file.end) {
    symbol = *(ptr++);
    hist[symbol].count++;
  }

  return hist;
}

// hufftree :: [Node] -> Node
Node *hufftree(Node *hist) {
  int i, n, x, y;

  n = 256;
  do {
    x = y = -1;
    for (i = 0; i < n; i++) {
      if (hist[i].count < 1) continue;

      if (y == -1) {
        y = i; // slots x and y available
      } else {
        if (x == -1) {
          if (hist[i].count < hist[y].count) {
            x = i; // take lower slot x
          } else {
            x = y; // shift y to lower slot x
            y = i;
          }
        } else {
          if (hist[i].count < hist[x].count) {
            y = x; // shift y to clear lower slot x
            x = i;
          } else if (hist[i].count < hist[y].count) {
            y = i; // replace slot y
          }
        }
      }
    }

    if (x != -1 && y != -1) {
      hist[n].count = hist[x].count + hist[y].count;
      hist[n].left = &hist[x];
      hist[n].right = &hist[y];
      n++;
      hist[x].count = hist[y].count = -1;
    }
  } while (x != -1 && y != -1);

  return &hist[y];
}

// print :: Node -> ()
void print(Node *n) {
  if (n->left != NULL) {
    // node
    printf("(");
    print(n->left);
    printf(", ");
    print(n->right);
    printf(")");
  } else {
    // leaf
    printf("%d", n->symbol);
  }
}

// data Bits = {
//   ptr :: Char *,
//   mask :: int,
//   value :: Bool
// }
typedef struct {
  char *ptr;
  int mask;
  Bool value;
} Bits;

// writeBit :: Bool -> Bits -> Bits
Bits writeBit(Bool value, Bits bits) {
  if (value == False) {
    *(bits.ptr) &= ~bits.mask;
  } else {
    *(bits.ptr) |= bits.mask;
  }

  bits.mask <<= 1;
  if (bits.mask == 0x100) {
    bits.ptr++;
    bits.mask = 0x01;
  }

  return bits;
}

// readBit :: Bits -> Bits
Bits readBit(Bits bits) {
  bits.value = ((*(bits.ptr)) & bits.mask) == bits.mask ? True : False;
  bits.mask <<= 1;
  if (bits.mask == 0x100) {
    bits.ptr++;
    bits.mask = 0x01;
  }

  return bits;
}

// writeSymbol :: Int -> Node -> Bits -> Bits
Bits writeSymbol(int symbol, Node *n, Bits bits) {
  char *p;
  Bits try;

  if (n->left != NULL) {
    try = writeBit(False, bits);
    try = writeSymbol(symbol, n->left, try);
    if (try.value == True) return try;

    try = writeBit(True, bits);
    try = writeSymbol(symbol, n->right, try);
    if (try.value == True) return try;

    bits.value = False;
    
    return bits;
  } else {
    bits.value = n->symbol == symbol ? True : False;

    return bits;
  }
}

// encode :: Node -> File -> File -> File
File encode(Node *tree, File source, File target) {
  Bits bits;
  char *ptr;

  bits.ptr = target.bytes;
  bits.mask = 0x01;

  ptr = source.bytes;
  while (ptr < source.end) {
    bits = writeSymbol(*(ptr++), tree, bits);
    if (bits.value == False) printf("Failed to encode symbol %d\n", *(ptr - 1)); 
  }

  if (bits.mask != 0x01) bits.ptr++;
  target.end = bits.ptr;

  return target;
}

// decode :: Node -> File -> File -> File
File decode(Node *tree, File target, File copy) {
  char *ptr;
  Bits bits;
  Node *cur;

  ptr = copy.bytes;

  bits.ptr = target.bytes;
  bits.mask = 0x01;
  while (ptr < copy.end && bits.ptr < target.end) {
    cur = tree;
    while (cur->left != NULL) {
      bits = readBit(bits);
      cur = bits.value == False ? cur->left : cur->right;
    }

    *(ptr++) = cur->symbol;
  }

  printf("Used: %d\n", bits.ptr - target.bytes);

  return copy;
}

// write :: File -> ()
void write(File file) {
  char *ptr;

  ptr = file.bytes;
  while (ptr < file.end) putchar(*(ptr++));
}

// main :: [Char *]
int main(int argc, char *argv[]) {
  File copy, source, target;
  Node *hist, *tree;

  source.bytes = (char *)malloc(16 * 1024 * sizeof(char));
  source = read(source);
  printf("Source: %d bytes\n", source.end - source.bytes);

  hist = (Node *)malloc(512 * sizeof(Node));
  hist = histogram(source, hist);
  tree = hufftree(hist);
  // print(tree); printf("\n");

  target.bytes = (char *)malloc(source.end - source.bytes);
  target = encode(tree, source, target);
  printf("Target: %d bytes\n", target.end - target.bytes);
  
  copy.bytes = (char *)malloc(source.end - source.bytes);
  copy.end = copy.bytes + (source.end - source.bytes);
  copy = decode(tree, target, copy);
  printf("Copy: %d bytes\n", copy.end - copy.bytes);
  write(copy);

  return 0;
}

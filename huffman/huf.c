#include <stdio.h>

typedef enum { False, True } Bool;

typedef struct {
  char *bytes;
  char *end;
} File;

File read(void) {
  File *file;
  char *ptr;
  int symbol;

  file = (File *)malloc(sizeof(File));
  ptr = file->bytes = (char *)malloc(16 * 1024);

  while ((symbol = getchar()) != EOF) *(ptr++) = symbol;

  file->end = ptr;

  return *file;
}

typedef struct node {
  int count;
  struct node *left;
  struct node *right;
  int symbol;
} Node;

Node *histogram(File file) {
  Node *hist;
  int symbol;
  char *ptr;

  hist = (Node *)malloc(512 * sizeof(Node));
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

typedef struct {
  char *ptr;
  int mask;
  Bool valid;
} Bits;

// addBit :: Bool -> Bits -> Bits
Bits addBit(Bool value, Bits bits) {
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
  bits.valid = ((*(bits.ptr)) & bits.mask) == bits.mask ? True : False;
  bits.mask <<= 1;
  if (bits.mask == 0x100) {
    bits.ptr++;
    bits.mask = 0x01;
  }

  return bits;
}

// writeBits :: Int -> Node -> Bits -> Bits
Bits writeBits(int symbol, Node *n, Bits bits) {
  char *p;
  Bits try;

  if (n->left != NULL) {
    try = addBit(False, bits);
    try = writeBits(symbol, n->left, try);
    if (try.valid == True) return try;

    try = addBit(True, bits);
    try = writeBits(symbol, n->right, try);
    if (try.valid == True) return try;

    bits.valid = False;
    
    return bits;
  } else {
    bits.valid = n->symbol == symbol ? True : False;

    return bits;
  }
}

File encode(Node *tree, File source) {
  File target;
  Bits bits;
  char *ptr;

  target.bytes = (char *)malloc(source.end - source.bytes);
  bits.ptr = target.bytes;
  bits.mask = 0x01;

  ptr = source.bytes;
  while (ptr < source.end) {
    bits = writeBits(*(ptr++), tree, bits);
    if (bits.valid == False) printf("Failed to encode symbol %d\n", *(ptr - 1)); 
  }

  if (bits.mask != 0x01) bits.ptr++;
  target.end = bits.ptr;

  return target;
}

File decode(Node *tree, File target, size_t length) {
  File copy;
  char *ptr;
  Bits bits;
  Node *cur;

  ptr = copy.bytes = (char *)malloc(length);
  copy.end = copy.bytes + length;

  bits.ptr = target.bytes;
  bits.mask = 0x01;
  while (ptr < copy.end && bits.ptr < target.end) {
    cur = tree;
    while (cur->left != NULL) {
      bits = readBit(bits);
      cur = bits.valid == False ? cur->left : cur->right;
    }

    *(ptr++) = cur->symbol;
  }

  printf("Used: %d\n", bits.ptr - target.bytes);

  return copy;
}

void write(File file) {
  char *ptr;

  ptr = file.bytes;
  while (ptr < file.end) putchar(*(ptr++));
}

int main(int argc, char *argv[]) {
  File copy, source, target;
  Node *hist, *tree;

  source = read();
  printf("Source: %d bytes\n", source.end - source.bytes);
  hist = histogram(source);
  tree = hufftree(hist);
  // print(tree); printf("\n");
  target = encode(tree, source);
  printf("Target: %d bytes\n", target.end - target.bytes);
  // printf("Bits: %x %x\n", *(target.bytes), *(target.bytes + 1));
  copy = decode(tree, target, source.end - source.bytes);
  printf("Copy: %d bytes\n", copy.end - copy.bytes);
  write(copy);

  return 0;
}

#include <stdio.h>

typedef struct file {
  char *bytes;
  char *end;
} File;

File read(void) {
  File *file;
  char *ptr;
  int symbol;

  file = (File *)malloc(sizeof(File));
  file->bytes = ptr = (char *)malloc(10 * 1024);

  while ((symbol = getchar()) != EOF) {
    *(ptr++) = symbol;
  }

  file->end = ptr;

  return *file;
}

typedef struct node {
  int count;
  struct node *left;
  struct node *right;
  int symbol;
} node;

node *histogram(File file) {
  node *hist;
  int symbol;
  char *ptr;

  hist = (node *)malloc(512 * sizeof(node));
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

int compare(void *a, void *b) {
  node *x, *y;

  x = (node *)a;
  y = (node *)b;

  if (x->count < y->count) {
    return -1;
  } else if (x->count > y->count) {
    return 1;
  }

  return 0;
}

node *hufftree(node *hist) {
  int i, n, x, y;
  node *tmp;

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

void print(node *n) {
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

char *encode(node *tree, char *source) {

}

void write(File file) {
  char *ptr;

  ptr = file.bytes;
  while (ptr < file.end) putchar(*(ptr++));
}

int main(int argc, char *argv[]) {
  File source;
  node *hist, *tree;

  source = read();
  hist = histogram(source);
  tree = hufftree(hist);
  

  return 0;
}

#include <stdio.h>

char *read(void) {
  char *file, *ptr;
  int symbol;

  file = ptr = (char *)malloc(10 * 1024);

  while ((symbol = getchar()) != EOF) {
    *(ptr++) = symbol;
  }

  return file;
}

int *histogram(char *source) {
  int *hist, symbol;

  hist = (int *)malloc(256 * sizeof(int));
  for (symbol = 0; symbol < 256; symbol++) {
    hist[symbol] = 0;
  }

  while (symbol = *(source++)) hist[symbol]++;

  return hist;
}

typedef struct node {
  
}

? huftree(int *hist) {

}

int main(int argc, char *argv[]) {
  char *source;
  int *hist, symbol;

  source = read();
  hist = histogram(source);
  tree = hufftree(hist);

  return 0;
}

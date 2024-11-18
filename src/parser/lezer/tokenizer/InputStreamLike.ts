export const InputStreamLike = (input: string) => {
  let position = 0;

  const self = {
    get next() {
      const char = input[position];
      return char ? input.charCodeAt(position) : -1;
    },
    get pos() {
      return position;
    },
    peek(val: number) {
      const char = input[position + val];
      return char ? input.charCodeAt(position + val) : -1;
    },
    advance(val = 1) {
      position += val;
    },
  };

  return self;
};

export type InputStreamLikeInstance = ReturnType<typeof InputStreamLike>;

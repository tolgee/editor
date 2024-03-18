export const InputStreamLike = (input: string) => {
  const codePoints = [...input].map((ch) => ch.charCodeAt(0));

  let position = 0;

  const self = {
    get next() {
      return codePoints[position] ?? -1;
    },
    get pos() {
      return position;
    },
    peek(val: number) {
      return codePoints[position + val] ?? -1;
    },
    advance(val = 1) {
      position += val;
    },
  };

  return self;
};

export type InputStreamLikeInstance = ReturnType<typeof InputStreamLike>;

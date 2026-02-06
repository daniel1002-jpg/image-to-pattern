declare module 'upng-js' {
  const UPNG: {
    encode: (buffers: ArrayBuffer[], width: number, height: number, cnum: number) => ArrayBuffer;
    decode: (buffer: ArrayBuffer) => unknown;
    toRGBA8: (decoded: unknown) => ArrayBuffer[];
  };
  export default UPNG;
}

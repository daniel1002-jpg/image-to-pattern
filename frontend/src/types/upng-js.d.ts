declare module 'upng-js' {
  const UPNG: {
    encode: (buffers: ArrayBuffer[], width: number, height: number, cnum: number) => ArrayBuffer;
  };
  export default UPNG;
}

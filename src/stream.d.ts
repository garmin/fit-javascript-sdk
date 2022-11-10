export default Stream;
declare class Stream {
  static LITTLE_ENDIAN: boolean;
  static BIG_ENDIAN: boolean;
  /**
   * Convenience method for creating a Stream from a byte array
   * @param {Array<number>} data An array of bytes
   * @returns {Stream} A new Stream object
   * @static
   */
  static fromByteArray(data: Array<number>): Stream;
  /**
   * Convenience method for creating a Stream from a Node Buffer
   * @param {Buffer} buffer - Node Buffer of bytes
   * @returns {Stream} A new Stream object
   * @static
   */
  static fromBuffer(buffer: Buffer): Stream;
  /**
   * Convenience method for creating a Stream from an ArrayBuffer
   * @param {ArrayBuffer} arrayBuffer - An ArrayBuffer of bytes
   * @returns {Stream} A new Stream object
   * @static
   */
  static fromArrayBuffer(arrayBuffer: ArrayBuffer): Stream;
  /**
   * Creates a Stream containing a FIT file
   * @constructor
   * @param {ArrayBuffer} stream - ArrayBuffer containing a FIT file
   */
  constructor(arrayBuffer: any);
  get length(): any;
  get bytesRead(): number;
  get position(): number;
  set crcCalculator(arg: any);
  get crcCalculator(): any;
  reset(): void;
  seek(position: any): void;
  slice(begin: any, end: any): any;
  peekByte(): number;
  readByte(): any;
  readBytes(size: any): any;
  readUInt8(): any;
  readInt8(): any;
  readUInt16(opts: any): any;
  readInt16(opts: any): any;
  readUInt32(opts: any): any;
  readInt32(opts: any): any;
  readUInt64(opts: any): any;
  readInt64(opts: any): any;
  readFloat32(opts: any): any;
  readFloat64(opts: any): any;
  readString(strlen: any): any;
  readValue(
    baseType: any,
    size: any,
    {
      endianness,
      convertInvalidToNull,
    }?: {
      endianness?: boolean;
      convertInvalidToNull?: boolean;
    }
  ): any;
}

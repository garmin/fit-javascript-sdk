export default Decoder;
declare class Decoder {
  /**
   * Inspects the file header to determine if the input stream is a FIT file
   * @param {Stream} stream
   * @returns {Boolean} True if the stream is a FIT file
   * @static
   */
  static isFIT(stream: Stream): boolean;
  static "__#6@#readFileHeader"(
    stream: any,
    resetPosition?: boolean
  ): {
    headerSize: any;
    protocolVersion: any;
    profileVersion: number;
    dataSize: any;
    dataType: any;
    headerCRC: number;
  };
  /**
   * Creates a FIT File Decoder
   * @constructor
   * @param {Stream} stream - representing the FIT file to decode
   */
  constructor(stream: Stream);
  /**
   * Inspects the file header to determine if the input stream is a FIT file
   * @returns {Boolean} True if the stream is a FIT file
   */
  isFIT(): boolean;
  /**
   * Checks that the input stream is a FIT file and verifies both the header and file CRC values
   * @returns {Boolean} True if the stream passes the isFit() and CRC checks
   */
  checkIntegrity(): boolean;
  /**
   * Message Listener Callback
   *
   * @callback Decoder~mesgListener
   * @param {Number} mesgNum - Profile.MesgNum
   * @param {Object} message - The message
   */
  /**
   * Read the messages from the stream.
   * @param {Object=} [options] - Read options (optional)
   * @param {Decoder~mesgListener} [options.mesgListener=null] - (optional, default null) mesgListener(mesgNum, message)
   * @param {Boolean} [options.expandSubFields=true] - (optional, default true)
   * @param {Boolean} [options.expandComponents=true] - (optional, default true)
   * @param {Boolean} [options.applyScaleAndOffset=true] - (optional, default true)
   * @param {Boolean} [options.convertTypesToStrings=true] - (optional, default true)
   * @param {boolean} [options.convertDateTimesToDates=true] - (optional, default true)
   * @param {Boolean} [options.includeUnknownData=false] - (optional, default false)
   * @param {boolean} [options.mergeHeartRates=true] - (optional, default false)
   * @return {Object} result - {messages:Array, errors:Array}
   */
  read({
    mesgListener,
    expandSubFields,
    expandComponents,
    applyScaleAndOffset,
    convertTypesToStrings,
    convertDateTimesToDates,
    includeUnknownData,
    mergeHeartRates,
  }?: any | undefined): any;
}
import Stream from "./stream.js";

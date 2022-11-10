declare namespace _default {
  export { FIT_EPOCH_MS };
  export { convertDateTimeToDate };
}
export default _default;
/**
 * The millisecond offset between UNIX and FIT Epochs (631065600000).
 * @const {number}
 */
declare const FIT_EPOCH_MS: 631065600000;
/**
 * Convert a FIT DateTime to a JavaScript Date
 * @param {number} datetime - Seconds since FIT EPOCH
 * @returns {Date} A JavaScript Date object
 */
declare function convertDateTimeToDate(datetime: number): Date;

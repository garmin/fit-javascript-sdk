export default CrcCalculator;
declare class CrcCalculator {
    static calculateCRC(buf: any, start: any, end: any): number;
    get crc(): number;
    addBytes(buf: any, start: any, end: any): number;
    #private;
}

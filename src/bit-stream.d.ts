export default BitStream;
declare class BitStream {
    constructor(data: any, baseType?: number);
    get bitsAvailable(): number;
    get hasBitsAvailable(): boolean;
    reset(): void;
    readBit(): number;
    readBits(nBitsToRead: any): number;
    #private;
}

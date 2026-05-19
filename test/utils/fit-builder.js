import CRC from "../../src/crc-calculator.js";
import FIT from "../../src/fit.js";

export const uint16LE = (value) => {
    const buf = new ArrayBuffer(2);
    new DataView(buf).setUint16(0, value, true);
    return [...new Uint8Array(buf)];
}

export const uint32LE = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setUint32(0, value, true);
    return [...new Uint8Array(buf)];
}

export const uint64LE = (value) => {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setBigUint64(0, BigInt(value), true);
    return [...new Uint8Array(buf)];
}

export const buildFit = (mesgNum, fieldDefs, records) => {
    const defn = [0x40, 0x00, 0x00, mesgNum & 0xFF, (mesgNum >> 8) & 0xFF, fieldDefs.length];
    for (const [fieldNum, sizeBytes, baseType] of fieldDefs) {
        defn.push(fieldNum, sizeBytes, baseType | FIT.BaseTypeDefinitions[baseType].baseTypeEndianFlag);
    }

    const data = [];
    for (const rec of records) {
        data.push(0x00, ...rec);
    }

    const dataSection = [...defn, ...data];

    const header = [0x0E, 0x20, 0xE8, 0x03];
    const dataSize = dataSection.length;
    header.push(dataSize & 0xFF, (dataSize >> 8) & 0xFF, (dataSize >> 16) & 0xFF, (dataSize >> 24) & 0xFF);
    header.push(0x2E, 0x46, 0x49, 0x54);
    const headerCrc = CRC.calculateCRC(header, 0, 12);
    header.push(headerCrc & 0xFF, (headerCrc >> 8) & 0xFF);

    const full = [...header, ...dataSection];
    const fileCrc = CRC.calculateCRC(full, 0, full.length);
    full.push(fileCrc & 0xFF, (fileCrc >> 8) & 0xFF);
    return full;
}
/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import BitStream from "../src/bit-stream.js";
import FIT from "../src/fit.js";

describe("Bit Stream Tests", () => {
    describe("Read Bit Tests", () => {
        test("readBit from byte array reads each bit LSB first", () => {
            const bitStream = new BitStream([0xAA, 0xFF], FIT.BaseType.UINT8);
            const expected = [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            expected.forEach((exp, index) => {
                expect(bitStream.bitsAvailable).toBe(expected.length - index);
                expect(bitStream.hasBitsAvailable).toBe(true);
                expect(bitStream.readBit()).toBe(exp);
                expect(bitStream.bitsAvailable).toBe(expected.length - index - 1);
            });
        });

        test("readBit from integer reads each bit LSB first", () => {
            const bitStream = new BitStream(0xAAFF, FIT.BaseType.UINT16);
            const expected = [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1];
            expected.forEach((exp, index) => {
                expect(bitStream.bitsAvailable).toBe(expected.length - index);
                expect(bitStream.hasBitsAvailable).toBe(true);
                expect(bitStream.readBit()).toBe(exp);
                expect(bitStream.bitsAvailable).toBe(expected.length - index - 1);
            });
        });
    });

    describe("Read Bits From Array Tests", () => {
        const parameters = [
            { label: "UInt8 [0xAB] - 8",                                    data: [0xAB],                               baseType: FIT.BaseType.UINT8,   nBitsToRead: [8],        values: [0xAB],                                                       takesFastPath: true  },
            { label: "UInt8 [0xAB] - 4,4",                                  data: [0xAB],                               baseType: FIT.BaseType.UINT8,   nBitsToRead: [4, 4],     values: [0xB, 0xA],                                                   takesFastPath: false },
            { label: "UInt8 [0xAB] - 4,1,1,1,1",                            data: [0xAB],                               baseType: FIT.BaseType.UINT8,   nBitsToRead: [4, 1, 1, 1, 1], values: [0xB, 0, 1, 0, 1],                               takesFastPath: false },
            { label: "UInt8 [0xAA, 0xCB] - 16 (cross-boundary)",            data: [0xAA, 0xCB],                         baseType: FIT.BaseType.UINT8,   nBitsToRead: [16],       values: [0xCBAA],                                                     takesFastPath: false },
            { label: "UInt8 [0xAA, 0xCB, 0xDE, 0xFF] - 16,16 (cross-boundary)", data: [0xAA, 0xCB, 0xDE, 0xFF],        baseType: FIT.BaseType.UINT8,   nBitsToRead: [16, 16],   values: [0xCBAA, 0xFFDE],                                             takesFastPath: false },
            { label: "UInt8 [0xAA, 0xCB, 0xDE, 0xFF] - 32 (cross-boundary)", data: [0xAA, 0xCB, 0xDE, 0xFF],           baseType: FIT.BaseType.UINT8,   nBitsToRead: [32],       values: [0xFFDECBAA],                                                 takesFastPath: false },
            { label: "UInt8 [0xAA, 0xBB] - 8,8",                            data: [0xAA, 0xBB],                         baseType: FIT.BaseType.UINT8,   nBitsToRead: [8, 8],     values: [0xAA, 0xBB],                                                 takesFastPath: true  },
            { label: "UInt16 [0xABCD, 0xEF01] - 16,16",                     data: [0xABCD, 0xEF01],                     baseType: FIT.BaseType.UINT16,  nBitsToRead: [16, 16],   values: [0xABCD, 0xEF01],                                             takesFastPath: true  },
            { label: "UInt16 [0xABCD, 0xEF01] - 32",                        data: [0xABCD, 0xEF01],                     baseType: FIT.BaseType.UINT16,  nBitsToRead: [32],       values: [0xEF01ABCD],                                                 takesFastPath: false },
            { label: "UInt32 [0xABCDEF01] - 32",                            data: [0xABCDEF01],                         baseType: FIT.BaseType.UINT32,  nBitsToRead: [32],       values: [0xABCDEF01],                                                 takesFastPath: true  },
            { label: "UInt32 [0xABCDEF01, 0x12345678] - 32,32",             data: [0xABCDEF01, 0x12345678],             baseType: FIT.BaseType.UINT32,  nBitsToRead: [32, 32],   values: [0xABCDEF01, 0x12345678],                                     takesFastPath: true  },
            { label: "UInt64 [0x7BCDEF0123456789] - 64",                    data: [0x7BCDEF0123456789n],                baseType: FIT.BaseType.UINT64,  nBitsToRead: [64],       values: [Number(0x7BCDEF0123456789n)],                                takesFastPath: true  },
            { label: "UInt64 two elements - 64,64",                         data: [0x7BCDEF0123456789n, 0x0BCDEF0123456789n], baseType: FIT.BaseType.UINT64, nBitsToRead: [64, 64], values: [Number(0x7BCDEF0123456789n), Number(0x0BCDEF0123456789n)], takesFastPath: true  },
            { label: "UInt64 [0xABCDEF0123456789] - 32 (lower half)",       data: [0xABCDEF0123456789n],                baseType: FIT.BaseType.UINT64,  nBitsToRead: [32],       values: [0x23456789],                                                 takesFastPath: false },
            { label: "UInt64 [0xABCDEF0123456789] - 32,32",                 data: [0xABCDEF0123456789n],                baseType: FIT.BaseType.UINT64,  nBitsToRead: [32, 32],   values: [0x23456789, 0xABCDEF01],                                     takesFastPath: false },
        ];

        test.each(parameters)("$label", (scenario) => {
            const bitStream = new BitStream(scenario.data, scenario.baseType);
            scenario.values.forEach((expected, index) => {
                expect(bitStream.readBits(scenario.nBitsToRead[index])).toBe(expected);
            });
            expect(bitStream.array === null).toBe(scenario.takesFastPath);
        });
    });

    describe("Read Bits From Integer Tests", () => {
        const parameters = [
            { label: "UInt8 0xAB - 8",                                       data: 0xAB,               baseType: FIT.BaseType.UINT8,   nBitsToRead: [8],           values: [0xAB],                      takesFastPath: true  },
            { label: "UInt8 0xAB - 4,4",                                     data: 0xAB,               baseType: FIT.BaseType.UINT8,   nBitsToRead: [4, 4],        values: [0xB, 0xA],                  takesFastPath: false },
            { label: "UInt8 0xAB - 4,1,1,1,1",                               data: 0xAB,               baseType: FIT.BaseType.UINT8,   nBitsToRead: [4, 1, 1, 1, 1], values: [0xB, 0, 1, 0, 1],        takesFastPath: false },
            { label: "UInt16 0xAACB - 16",                                    data: 0xAACB,             baseType: FIT.BaseType.UINT16,  nBitsToRead: [16],          values: [0xAACB],                    takesFastPath: true  },
            { label: "UInt32 0xABCDEF01 - 16,16",                            data: 0xABCDEF01,         baseType: FIT.BaseType.UINT32,  nBitsToRead: [16, 16],      values: [0xEF01, 0xABCD],            takesFastPath: false },
            { label: "UInt32 0xABCDEF01 - 32",                               data: 0xABCDEF01,         baseType: FIT.BaseType.UINT32,  nBitsToRead: [32],          values: [0xABCDEF01],                takesFastPath: true  },
            { label: "UInt64 0x7BCDEF0123456789 - 64",                       data: 0x7BCDEF0123456789n, baseType: FIT.BaseType.UINT64, nBitsToRead: [64],          values: [Number(0x7BCDEF0123456789n)], takesFastPath: true },
            { label: "UInt64 0xABCDEF0123456789 - 64",                       data: 0xABCDEF0123456789n, baseType: FIT.BaseType.UINT64, nBitsToRead: [64],          values: [Number(0xABCDEF0123456789n)], takesFastPath: true },
            { label: "UInt64 0xABCDEF0123456789 - 32 (lower half)",          data: 0xABCDEF0123456789n, baseType: FIT.BaseType.UINT64, nBitsToRead: [32],          values: [0x23456789],                takesFastPath: false },
            { label: "UInt64 0xABCDEF0123456789 - 32,32",                    data: 0xABCDEF0123456789n, baseType: FIT.BaseType.UINT64, nBitsToRead: [32, 32],      values: [0x23456789, 0xABCDEF01],    takesFastPath: false },
            { label: "SInt8 25 - 8 positive value unchanged by mask",        data: 25,                 baseType: FIT.BaseType.SINT8,   nBitsToRead: [8],           values: [25],                        takesFastPath: true  },
            { label: "SInt8 -56 (0xC8) - 8 unsigned bit pattern",            data: -56,                baseType: FIT.BaseType.SINT8,   nBitsToRead: [8],           values: [200],                       takesFastPath: true  },
            { label: "SInt16 500 - 16 positive value unchanged by mask",     data: 500,                baseType: FIT.BaseType.SINT16,  nBitsToRead: [16],          values: [500],                       takesFastPath: true  },
            { label: "SInt16 -1 (0xFFFF) - 16 unsigned bit pattern",         data: -1,                 baseType: FIT.BaseType.SINT16,  nBitsToRead: [16],          values: [0xFFFF],                    takesFastPath: true  },
            { label: "Float32 0x3FC00000 (1.5f) - 32 bit mask",              data: 0x3FC00000,         baseType: FIT.BaseType.FLOAT32, nBitsToRead: [32],          values: [0x3FC00000],                takesFastPath: true  },
            { label: "Float64 0x3FF8000000000000 (1.5d) - 64 bit mask",      data: 0x3FF8000000000000n, baseType: FIT.BaseType.FLOAT64, nBitsToRead: [64],         values: [Number(0x3FF8000000000000n)], takesFastPath: true },
        ];

        test.each(parameters)("$label", (scenario) => {
            const bitStream = new BitStream(scenario.data, scenario.baseType);
            scenario.values.forEach((expected, index) => {
                expect(bitStream.readBits(scenario.nBitsToRead[index])).toBe(expected);
            });
            expect(bitStream.array === null).toBe(scenario.takesFastPath);
        });
    });

    describe("Exception Tests", () => {
        test("readBits throws when no bits available", () => {
            const bitStream = new BitStream(0xABCDEFFF, FIT.BaseType.UINT32);
            bitStream.readBits(32);
            expect(() => { bitStream.readBits(2) }).toThrowError("FIT Runtime Error");
        });

        test("readBit throws when no bits available", () => {
            const bitStream = new BitStream(0xAB, FIT.BaseType.UINT8);
            bitStream.readBits(8);
            expect(() => { bitStream.readBit() }).toThrowError("FIT Runtime Error");
        });
    });

    describe("Deferred Init Tests", () => {
        test("fast path fires for each full-element read leaving array null between reads", () => {
            const bitStream = new BitStream([0x11, 0x22, 0x33], FIT.BaseType.UINT8);
            expect(bitStream.array).toBeNull();
            expect(bitStream.readBits(8)).toBe(0x11);
            expect(bitStream.array).toBeNull();
            expect(bitStream.bitsAvailable).toBe(16);
            expect(bitStream.readBits(8)).toBe(0x22);
            expect(bitStream.array).toBeNull();
            expect(bitStream.readBits(8)).toBe(0x33);
            expect(bitStream.bitsAvailable).toBe(0);
        });

        test("partial read after fast-path consumption initialises array at correct offset", () => {
            const bitStream = new BitStream([0xAB, 0xCD], FIT.BaseType.UINT8);
            expect(bitStream.readBits(8)).toBe(0xAB);
            expect(bitStream.array).toBeNull();
            expect(bitStream.readBits(4)).toBe(0xD);
            expect(bitStream.array).not.toBeNull();
            expect(bitStream.readBits(4)).toBe(0xC);
            expect(bitStream.bitsAvailable).toBe(0);
        });

        test("readBit after fast-path consumption initialises array lazily", () => {
            const bitStream = new BitStream([0xFF, 0x00], FIT.BaseType.UINT8);
            expect(bitStream.readBits(8)).toBe(0xFF);
            expect(bitStream.array).toBeNull();
            expect(bitStream.readBit()).toBe(0);
            expect(bitStream.array).not.toBeNull();
            for (let i = 0; i < 7; i++) {
                expect(bitStream.readBit()).toBe(0);
            }
            expect(bitStream.bitsAvailable).toBe(0);
        });

        test("reset restores array to null making fast path available again", () => {
            const bitStream = new BitStream([0x12, 0x34], FIT.BaseType.UINT8);
            bitStream.readBits(4);
            expect(bitStream.array).not.toBeNull();
            bitStream.reset();
            expect(bitStream.array).toBeNull();
            expect(bitStream.bitsAvailable).toBe(16);
            expect(bitStream.readBits(8)).toBe(0x12);
            expect(bitStream.readBits(8)).toBe(0x34);
        });
    });
});

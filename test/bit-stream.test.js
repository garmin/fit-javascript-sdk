/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2022 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import BitStream from "../src/bit-stream.js";
import FIT from "../src/fit.js";

describe("Bit Stream Tests", () => {
    describe("From Byte Array Tests", () => {
        test("Next Bit", () => {
            const bitStream = new BitStream([0xAA, 0xAA]);
            const values = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
            values.forEach((expected, index) => {
                expect(bitStream.bitsAvailable === values.length - index);
                expect(bitStream.hasBitsAvailable);

                const actual = bitStream.readBit();
                expect(actual).toBe(expected);

                expect(bitStream.bitsAvailable === values.length - index - 1);
                expect(bitStream.hasBitsAvailable === (values.length === index + 1));
            });
        });

        const parameters = [
            {
                data: [0xAA],
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [4, 4],
                values: [0xA, 0xA]
            },
            {
                data: [0xAA],
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [8],
                values: [0xAA]
            },
            {
                data: [0xAA, 0xAA],
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [16],
                values: [0xAAAA]
            },
            {
                data: [0xFF, 0xFF],
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [16],
                values: [0xFFFF]
            },
            {
                data: [0xAA, 0xAA, 0xAA, 0x2A],
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [32],
                values: [0x2AAAAAAA]
            },

            {
                data: [0x10, 0x32, 0x54, 0x76],
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [32],
                values: [0x76543210]
            },
        ]
        test.each(parameters)(
            "Test %s",
            (scenario) => {
                const bitStream = new BitStream(scenario.data, scenario.baseType);
                scenario.values.forEach((expected, index) => {
                    const actual = bitStream.readBits(scenario.nBitsToRead[index]);
                    expect(actual).toBe(expected);
                });
            });
    });

    describe("From Integer Tests", () => {
        test("Next Bit", () => {
            const bitStream = new BitStream(0x0FAA, FIT.BaseType.UINT16);
            const values = [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0];
            values.forEach((expected) => {
                const actual = bitStream.readBit();
                expect(actual).toBe(expected);
            });

        });

        const parameters = [
            {
                data: 0xAA,
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [4],
                values: [0xA]
            },
            {
                data: 0xAA,
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [4, 4],
                values: [0xA, 0xA]
            },
            {
                data: 0xAA,
                baseType: FIT.BaseType.UINT8,
                nBitsToRead: [4, 1, 1, 1, 1],
                values: [0xA, 0x0, 0x1, 0x0, 0x1]
            },
            {
                data: 0xAA,
                baseType: FIT.BaseType.UINT16,
                nBitsToRead: [4, 1, 1, 1, 1],
                values: [0xA, 0x0, 0x1, 0x0, 0x1]
            },
            {
                data: [0xAAAA, 0x2AAA],
                baseType: FIT.BaseType.UINT16,
                nBitsToRead: [32],
                values: [0x2AAAAAAA]
            },
            {
                data: [0xAAAAAAAA],
                baseType: FIT.BaseType.UINT32,
                nBitsToRead: [16, 8, 8],
                values: [0xAAAA, 0xAA, 0xAA]
            },
        ];

        test.each(parameters)(
            "Test %s",
            (scenario) => {
                const bitStream = new BitStream(scenario.data, scenario.baseType);
                scenario.values.forEach((expected, index) => {
                    const actual = bitStream.readBits(scenario.nBitsToRead[index]);
                    expect(actual).toBe(expected);
                });
            });
    });

    describe("Should Thrown When Reading More Bits Than Available Tests", () => {
        test("When reading more bits than available readBit() should throw", () => {
            const bitStream = new BitStream(0xAAAA, FIT.BaseType.UINT16);
            bitStream.readBits(16);
            expect(() => { bitStream.readBit() }).toThrowError("FIT Runtime Error");
        });

        test("When reading more bits than available readBits() should throw", () => {
            const bitStream = new BitStream(0xAAAA, FIT.BaseType.UINT16);
            expect(() => { bitStream.readBits(32) }).toThrowError("FIT Runtime Error");
        });
    });
});

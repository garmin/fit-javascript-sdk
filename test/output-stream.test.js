/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2025 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";
import FIT from "../src/fit.js";
import OutputStream from "./src/output-stream.js";

test("New OutputStream has a length of zero", () => {
    const outputStream = new OutputStream();

    expect(outputStream.length).toBe(0);
});

test("Outputstream supports iterable protocol", () => {
    const outputStream = new OutputStream();

    outputStream.writeUInt32(0x03020100);

    expect([...outputStream,]).toEqual([0, 1, 2, 3,]);
});

test("Outputstream can set Typed Array", () => {
    const outputStream = new OutputStream();

    outputStream.set(new Uint8Array([0, 1, 2, 3,]), 1);

    expect([...outputStream,]).toEqual([0, 0, 1, 2, 3,]);
});

describe("Can write single values to an OutputStream", () => {
    test("Outputstream has a length of 1 when writing a Byte", () => {
        const outputStream = new OutputStream();

        outputStream.writeByte(1);

        expect(outputStream.length).toBe(1);
    });


    test("Outputstream has a length of 1 when writing a UInt8", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt8(1);

        expect(outputStream.length).toBe(1);
    });

    test("Outputstream has a length of 2 when writing a UInt16", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt16(1);

        expect(outputStream.length).toBe(2);
    });

    test("Outputstream has a length of 4 when writing a UInt32", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt32(1);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing a UInt64", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt64(0x0807060504030201n);

        expect(outputStream.length).toBe(8);
    });


    test("Outputstream has a length of 1 when writing a UInt8z", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt8z(1);

        expect(outputStream.length).toBe(1);
    });

    test("Outputstream has a length of 2 when writing a UInt16z", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt16z(1);

        expect(outputStream.length).toBe(2);
    });

    test("Outputstream has a length of 4 when writing a UInt32z", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt32z(1);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing a UInt64z", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt64z(0x0807060504030201n);

        expect(outputStream.length).toBe(8);
    });

    test("Outputstream has a length of 1 when writing a SInt8", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt8(1);

        expect(outputStream.length).toBe(1);
    });

    test("Outputstream has a length of 2 when writing a SInt16", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt16(1);

        expect(outputStream.length).toBe(2);
    });

    test("Outputstream has a length of 4 when writing a SInt32", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt32(1);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing a SInt64", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt64(0x0807060504030201n);

        expect(outputStream.length).toBe(8);
    });

    test("Outputstream has a length of 4 when writing a Float32", () => {
        const outputStream = new OutputStream();

        outputStream.writeFloat32(1234.5678);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing a Float32", () => {
        const outputStream = new OutputStream();

        outputStream.writeFloat64(1234.5678);

        expect(outputStream.length).toBe(8);
    });
});

describe("Can write an array of values to an OutputStream", () => {
    test("Outputstream has a length of 4 when writing an array of 4 byte values", () => {
        const outputStream = new OutputStream();

        outputStream.writeByte([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 4 when writing an array of 4 UInt8 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt8([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing an array of 4 UInt16 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt16([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(8);
    });

    test("Outputstream has a length of 16 when writing an array of 4 UInt32 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt32([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(16);
    });

    test("Outputstream has a length of 32 when writing an array of 4 UInt64 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt64([0n, 1n, 2n, 3n,]);

        expect(outputStream.length).toBe(32);
    });

    test("Outputstream has a length of 4 when writing an array of 4 UInt8z values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt8z([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing an array of 4 UInt16z values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt16z([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(8);
    });

    test("Outputstream has a length of 16 when writing an array of 4 UInt32z values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt32z([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(16);
    });

    test("Outputstream has a length of 32 when writing an array of 4 UInt64z values", () => {
        const outputStream = new OutputStream();

        outputStream.writeUInt64z([0n, 1n, 2n, 3n,]);

        expect(outputStream.length).toBe(32);
    });

    test("Outputstream has a length of 4 when writing an array of 4 SInt8 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt8([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(4);
    });

    test("Outputstream has a length of 8 when writing an array of 4 SInt16 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt16([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(8);
    });

    test("Outputstream has a length of 16 when writing an array of 4 SInt32 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt32([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(16);
    });

    test("Outputstream has a length of 32 when writing an array of 4 SInt64 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeSInt64([0n, 1n, 2n, 3n,]);

        expect(outputStream.length).toBe(32);
    });

    test("Outputstream has a length of 16 when writing an array of 4 Float32 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeFloat32([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(16);
    });

    test("Outputstream has a length of 32 when writing an array of 4 Float64 values", () => {
        const outputStream = new OutputStream();

        outputStream.writeFloat64([0, 1, 2, 3,]);

        expect(outputStream.length).toBe(32);
    });
});

describe("When writing type X Outputstream has a length of Y", () => {
    test.each([
        [FIT.BaseType.UINT8, 1, 1,],
        [FIT.BaseType.SINT8, 1, 1,],
        [FIT.BaseType.UINT16, 1, 2,],
        [FIT.BaseType.SINT16, 1, 2,],
        [FIT.BaseType.UINT32, 1, 4,],
        [FIT.BaseType.SINT32, 1, 4,],
        [FIT.BaseType.UINT64, 1n, 8,],
        [FIT.BaseType.SINT64, 1n, 8,],
        [FIT.BaseType.FLOAT32, 1, 4,],
        [FIT.BaseType.FLOAT64, 1, 8,],
    ])("When writing a %s of value %i Outputstream has a length of %i", (type, value, expectedLength) => {
        const outputStream = new OutputStream();

        outputStream.write(value, type);

        expect(outputStream.length).toBe(expectedLength);
    });
});

describe("Can write strings to an OutputStream", () => {

    test("OutputStream should append null terminator when writing a string", () => {
        const outputStream = new OutputStream();

        outputStream.writeString(".FIT");

        expect(outputStream.length).toBe(5);
    });

    test("Can write an array of strings to an OutputStream", () => {
        const outputStream = new OutputStream();

        outputStream.writeString([".FIT", ".FIT"]);

        expect(outputStream.length).toBe(10);
    });
});

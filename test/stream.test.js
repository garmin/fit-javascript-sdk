/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import Stream from "../src/stream.js";
import FIT from "../src/fit.js";

describe("Stream Tests", () => {
    describe("Little Endian Tests", () => {

        test("Peak Byte", () => {
            const stream = Stream.fromByteArray([0x01]);
            const peeked = stream.peekByte();
            const value = stream.readByte();
            expect(peeked).toBe(value);
        });

        test("Read Byte", () => {
            const stream = Stream.fromByteArray([0x01]);
            const value = stream.readByte();
            expect(value).toBe(0x01);
        });

        test("Read Bytes", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03]);
            const values = stream.readBytes(3);
            expect(values.byteLength).toBe(3);
            expect(Array.from(new Uint8Array(values))).toEqual([0x01, 0x02, 0x03]);
        });

        test("When trying to read more bytes than are avaialbe, should throw an error", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03]);
            expect(() => { stream.readBytes(4) }).toThrowError("FIT Runtime Error");
        });

        test("Read UInt8", () => {
            const stream = Stream.fromByteArray([0x01]);
            const value = stream.readUInt8();
            expect(value).toBe(0x01);
        });

        test("Read Int8", () => {
            const stream = Stream.fromByteArray([0xFE]);
            const value = stream.readInt8();
            expect(value).toBe(-2);
        });

        test("Read UInt8 Array", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03]);
            const values = stream.readValue(FIT.BaseType.UINT8, 3);
            expect(values.length).toBe(3);
            expect(Array.from(new Uint8Array(values))).toEqual([1, 2, 3]);
        });

        test("Read UInt16", () => {
            const stream = Stream.fromByteArray([0x01, 0x02]);
            const value = stream.readUInt16();
            expect(value).toBe(0x0201);
        });

        test("Read Max Uint16 Value succeeds", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF]);
            const value = stream.readUInt16();
            expect(value).toBe(0xFFFF);
        });

        test("Read Int16", () => {
            const stream = Stream.fromByteArray([0xFE, 0xFF]);
            const value = stream.readInt16();
            expect(value).toBe(-2);
        });

        test("Read Max Int16 Value succeeds", () => {
            const stream = Stream.fromByteArray([0xFF, 0x7F]);
            const value = stream.readUInt16();
            expect(value).toBe(0x7FFF);
        });

        test("Read UInt16 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x01, 0x00],
                ...[0x02, 0x00],
                ...[0x03, 0x00]
            ]);
            const values = stream.readValue(FIT.BaseType.UINT16, 6);
            expect(values.length).toBe(3);
            expect(Array.from(new Uint16Array(values))).toEqual([1, 2, 3]);
        });

        test("Read UInt32", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03, 0x04]);
            const value = stream.readUInt32();
            expect(value).toBe(0x04030201);
        });

        test("Read Int32", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF]);
            const value = stream.readInt32();
            expect(value).toBe(-1);
        });

        test("Read Max Int32 Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0x7F]);
            const value = stream.readInt32();
            expect(value).toBe(0x7FFFFFFF);
        });


        test("Read Max UInt32 Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF]);
            const value = stream.readUInt32();
            expect(value).toBe(0xFFFFFFFF);
        });

        test("Read UInt32 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x01, 0x00, 0x00, 0x00],
                ...[0x02, 0x00, 0x00, 0x00],
                ...[0x03, 0x00, 0x00, 0x00]
            ]);
            const values = stream.readValue(FIT.BaseType.UINT32, 12);
            expect(values.length).toBe(3);
            expect(Array.from(new Uint32Array(values))).toEqual([1, 2, 3]);
        });

        test("Read UInt64", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
            const value = stream.readUInt64();
            expect(value).toBe(0x0807060504030201n);
        });

        test("Read Int64", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
            const value = stream.readInt64();
            expect(value).toBe(-1n);
        });


        test("Read Max Int64 Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F]);
            const value = stream.readInt64();
            expect(value).toBe(0x7FFFFFFFFFFFFFFFn);
        });

        test("Read Max UInt64 Value succeeds", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
            const value = stream.readUInt64();
            expect(value).toBe(0xFFFFFFFFFFFFFFFFn);
        });

        test("Read UInt64 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
                ...[0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
                ...[0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
            ]);
            const values = stream.readValue(FIT.BaseType.UINT64, 24);
            expect(values.length).toBe(3);
            expect(Array.from(new BigUint64Array(values))).toEqual([1n, 2n, 3n]);
        });

        test("Read Float32 Positive", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x80, 0x3F]);
            const value = stream.readFloat32();
            expect(value).toBe(1);
        });

        test("Read Float32 Negative Value", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x80, 0xBF]);
            const value = stream.readFloat32();
            expect(value).toBe(-1);
        });

        test("Read Max Float32 Positive Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0x7F, 0x7F]);
            const value = stream.readFloat32();
            expect(value).toBeCloseTo(3.4028234663852886e+38);
        });

        test("Read Max Float32 Negative Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0x7F, 0xFF]);
            const value = stream.readFloat32();
            expect(value).toBeCloseTo(-3.4028234663852886e+38);
        });


        test("Read Float32 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x00, 0x00, 0x80, 0x3F],
                ...[0x00, 0x00, 0x00, 0x40],
                ...[0x00, 0x00, 0x40, 0x40]
            ]);
            const values = stream.readValue(FIT.BaseType.FLOAT32, 12);
            expect(values.length).toBe(3);
            expect(Array.from(new Float32Array(values))).toEqual([1.0, 2.0, 3.0]);
        });

        test("Read Float64 Positive", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F]);
            const value = stream.readFloat64();
            expect(value).toBe(1);
        });

        test("Read Float64 Negative", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF]);
            const value = stream.readFloat64();
            expect(-1).toBe(value);
        });

        test("Read Float64 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F],
                ...[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40],
                ...[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x40]
            ]);
            const values = stream.readValue(FIT.BaseType.FLOAT64, 24);
            expect(values.length).toBe(3);
            expect([1.0, 2.0, 3.0]).toEqual(Array.from(new Float64Array(values)));
        });

        test("Test Bytes Read", () => {
            const stream = Stream.fromByteArray([0xF]);
            stream.readValue(FIT.BaseType.BYTE, 1)
            const value = stream.bytesRead
            expect(value).toBe(1);
        });

        test("Test invalid BaseType", () => {
            const stream = Stream.fromByteArray([0xFFFF]);
            expect(() => {
                stream.readValue(0xFF);
            }).toThrowError();
        });
    });

    describe("Big Endian Tests", () => {
        test("Read UInt16", () => {
            const stream = Stream.fromByteArray([0x01, 0x02].reverse());
            const value = stream.readUInt16({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(0x0201);
        });

        test("Read Int16", () => {
            const stream = Stream.fromByteArray([0xFE, 0xFF].reverse());
            const value = stream.readInt16({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(-2);
        });

        test("Read UInt16 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x01, 0x00].reverse(),
                ...[0x02, 0x00].reverse(),
                ...[0x03, 0x00].reverse()
            ]);
            const values = stream.readValue(FIT.BaseType.UINT16, 6, { endianness: Stream.BIG_ENDIAN });
            expect(values.length).toBe(3);
            expect(Array.from(new Uint16Array(values))).toEqual([1, 2, 3]);
        });

        test("Read UInt32", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03, 0x04].reverse());
            const value = stream.readUInt32({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(0x04030201);
        });

        test("Read Int32", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF].reverse());
            const value = stream.readInt32({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(-1);
        });

        test("Read UInt32 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x01, 0x00, 0x00, 0x00].reverse(),
                ...[0x02, 0x00, 0x00, 0x00].reverse(),
                ...[0x03, 0x00, 0x00, 0x00].reverse()
            ]);
            const values = stream.readValue(FIT.BaseType.UINT32, 12, { endianness: Stream.BIG_ENDIAN });
            expect(values.length).toBe(3);
            expect(Array.from(new Uint32Array(values))).toEqual([1, 2, 3]);
        });

        test("Read UInt64", () => {
            const stream = Stream.fromByteArray([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08].reverse());
            const value = stream.readUInt64({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(0x0807060504030201n);
        });

        test("Read Int64", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF].reverse());
            const value = stream.readInt64({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(-1n);
        });

        test("Read UInt64 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00].reverse(),
                ...[0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00].reverse(),
                ...[0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00].reverse()
            ]);
            const values = stream.readValue(FIT.BaseType.UINT64, 24, { endianness: Stream.BIG_ENDIAN });
            expect(values.length).toBe(3);
            expect(Array.from(new BigUint64Array(values))).toEqual([1n, 2n, 3n]);
        });

        test("Read Float32 Positive", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x80, 0x3F].reverse());
            const value = stream.readFloat32({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(1);
        });

        test("Read Float32 Negative Value", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x80, 0xBF].reverse());
            const value = stream.readFloat32({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(-1);
        });

        test("Read Max Float32 Positive Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0x7F, 0x7F].reverse());
            const value = stream.readFloat32({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBeCloseTo(3.4028234663852886e+38);
        });

        test("Read Max Float32 Negative Value", () => {
            const stream = Stream.fromByteArray([0xFF, 0xFF, 0x7F, 0xFF].reverse());
            const value = stream.readFloat32({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBeCloseTo(-3.4028234663852886e+38);
        });

        test("Read Float32 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x00, 0x00, 0x80, 0x3F].reverse(),
                ...[0x00, 0x00, 0x00, 0x40].reverse(),
                ...[0x00, 0x00, 0x40, 0x40].reverse()
            ]);
            const values = stream.readValue(FIT.BaseType.FLOAT32, 12, { endianness: Stream.BIG_ENDIAN });
            expect(values.length).toBe(3);
            expect(Array.from(new Float32Array(values))).toEqual([1.0, 2.0, 3.0]);
        });

        test("Read Float64 Positive", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F].reverse());
            const value = stream.readFloat64({ endianness: Stream.BIG_ENDIAN });
            expect(value).toBe(1);
        });

        test("Read Float64 Negative", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF].reverse());
            const value = stream.readFloat64({ endianness: Stream.BIG_ENDIAN });
            expect(-1).toBe(value);
        });

        test("Read Float64 Array", () => {
            const stream = Stream.fromByteArray([
                ...[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F].reverse(),
                ...[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40].reverse(),
                ...[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x40].reverse()
            ]);
            const values = stream.readValue(FIT.BaseType.FLOAT64, 24, { endianness: Stream.BIG_ENDIAN });
            expect(values.length).toBe(3);
            expect([1.0, 2.0, 3.0]).toEqual(Array.from(new Float64Array(values)));
        });
    });

    describe("String Tests", () => {
        test("Read String w/o Null Terminator", () => {
            const stream = Stream.fromByteArray([0x2E, 0x46, 0x49, 0x54]);
            const value = stream.readString(4);
            expect(value).toBe(".FIT");
        });

        test("Read String w/ Null Terminator", () => {
            const stream = Stream.fromByteArray([0x2E, 0x46, 0x49, 0x54, 0x00, 0x00]);
            const value = stream.readString(6);
            expect(value).toBe(".FIT");
        });

        test("Read Multibyte String w/o Null Terminator", () => {
            const stream = Stream.fromByteArray([
                0xe8, 0xbf, 0x99, 0xe5, 0xa5, 0x97, 0xe5, 0x8a, 0xa8, 0xe4, 0xbd,
                0x9c, 0xe7, 0x94, 0xb1, 0xe4, 0xb8, 0xa4, 0xe7, 0xbb, 0x84]);
            const value = stream.readString(21);
            expect(value).toBe("这套动作由两组");
        });

        test("Read Multibyte String w/ Null Terminator", () => {
            const stream = Stream.fromByteArray([
                0xe8, 0xbf, 0x99, 0xe5, 0xa5, 0x97, 0xe5, 0x8a, 0xa8, 0xe4, 0xbd,
                0x9c, 0xe7, 0x94, 0xb1, 0xe4, 0xb8, 0xa4, 0xe7, 0xbb, 0x84, 0x00]);
            const value = stream.readString(22);
            expect(value).toBe("这套动作由两组");
        });

        test("Read String Array w/o Null Terminator", () => {
            const stream = Stream.fromByteArray([0x2E, 0x46, 0x49, 0x54, 0x00, 0x2E, 0x46, 0x49, 0x54]);
            const values = stream.readString(9);
            expect(values.length).toBe(2);
            values.forEach(value => expect(value).toBe(".FIT"));
        });

        test("Read String Array w/ Null Terminator", () => {
            const stream = Stream.fromByteArray([0x2E, 0x46, 0x49, 0x54, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x00]);
            const values = stream.readString(10);
            expect(values.length).toBe(2);
            values.forEach(value => expect(value).toBe(".FIT"));
        });

        test("fitFile_CA76065_WithBadUtf8CharactersTest", () => {
            const stream = Stream.fromByteArray([
                0x37, 0x35, 0x25, 0x20, 0x65, 0x66, 0x66, 0x6F, 0x72, 0x74, 0x2E, 0x00, 0x65, 0x66, 0x66, 0x6F,
                0x72, 0x74, 0x2E, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF,
                0x75, 0x6E, 0x00, 0x01, 0x00, 0x00, 0x00, 0x20, 0x00, 0x03, 0x40, 0x00, 0x01, 0x00, 0x1B, 0x07,
                0xFE, 0x02, 0x84, 0x07, 0x01, 0x00, 0x03, 0x01, 0x00, 0x04, 0x04, 0x86, 0x01, 0x01,
                0x00, 0x02, 0x04, 0x86, 0x08, 0x0C, 0x07, 0x00, 0x00, 0x00, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00,
                0x01, 0x00, 0x01, 0xD7, 0x7C, 0x37, 0x35, 0x25, 0x20, 0x65, 0x66, 0x66, 0x6F, 0x72, 0x74, 0x2E,
                0x00, 0x40, 0x00, 0x01, 0x00, 0x1B, 0x0B, 0xFE, 0x02, 0x84, 0x07, 0x01, 0x00, 0x03, 0x01,
                0x00, 0x05, 0x04, 0x86, 0x06, 0x04, 0x86, 0x04, 0x04, 0x86, 0x01, 0x01, 0x00, 0x02,
                0x04, 0x86, 0x08, 0x10, 0x07, 0x0A, 0x02, 0x84, 0x0B, 0x02, 0x84, 0x00, 0x00, 0x01,
                0x00, 0x00, 0x00, 0x00, 0x08, 0xEB, 0x00, 0x03, 0x7B, 0xD7, 0x00, 0x00, 0x00, 0x00, 0x01,
                0x00, 0x03, 0xAE, 0xF8, 0x52, 0x61, 0x63, 0x65, 0x20, 0x67, 0x6F, 0x61, 0x6C, 0x20, 0x70,
                0x61, 0x63, 0x65, 0x2E, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x02, 0x03, 0x02, 0xFF,
                0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00,
                0x00, 0x00, 0x01, 0x00, 0x01, 0xD7, 0x7C, 0x37, 0x35, 0x25, 0x20, 0x65, 0x66]);
            const values = stream.readString(200);
            expect(values.length).toBe(54);
            expect(values[0]).toBe("75% effort.");
            expect(values[6]).toBe("un"); // Not "����un"
            expect(values[13]).toBe(""); // Not "��"
            expect(values[42]).toBe("Race goal pace."); // Not "��Race goal pace.""
            expect(values[53]).toBe("|75% ef"); // Not "�|75% ef"
        });

        test("Read String Array w/o Null Terminator", () => {
            const stream = Stream.fromByteArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const values = stream.readString(9);
            expect(values).toBeNull();
        });
    });
});

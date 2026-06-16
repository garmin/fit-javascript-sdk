/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import { describe, expect, test } from "vitest";

import { Profile, Encoder, Utils } from "../src/index.js";
import { DEFAULT_CUSTOM_MESG_NUM, addCustomMesgToFitProfile, encodeThenDecodeMesgs, encodeMesgs, } from "./testUtils.js";

describe("Encoder Tests", () => {
    test("A file encoded with no messages should be 16 bytes long.", () => {
        const encoder = new Encoder();
        const uint8Array = encoder.close();

        expect(uint8Array.length).toBe(16);
    });

    test("Can encode a FIT file.", () => {
        const fileIdMesg = {
            type: "activity",
            manufacturer: "development",
            product: 0,
            timeCreated: 1000000000, // Wed, 08 Sep 2021 01:46:40 GMT
            serialNumber: 1234,
        };

        try {
            const encoder = new Encoder();
            encoder.onMesg(Profile.MesgNum.FILE_ID, fileIdMesg);
            const uint8Array = encoder.close();

            expect(uint8Array.length).toBe(51);
        }
        catch (error) {
            console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
            throw error;
        }
    });

    describe("Can Encode Strings Tests", () => {
        test("Can encode a short string of single byte charactors", () => {
            const fileIdMesg = {
                productName: "Short String Of Single Byte Characters",
            };

            try {
                const uint8Array = encodeMesgs([{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }]);

                expect(uint8Array.length).toBe(65);
            }
            catch (error) {
                console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
                throw error;
            }
        });

        test("Encoding a single byte string greater than 255 bytes in length throws an exception", () => {
            const fileIdMesg = {
                productName: "AS4EgyRNHimg4Pw3bUiFQwGyOttIQti8kHzPcfoUQ1kxi4PGVpwuE7MVlfnA0PjvIdWYnwemn" +
                    "L5yDX4LmULwXFTt8jGqfafPSoL3CXmYVGaTHuB1ILbjdVtPGPm0FQPyS6NVeJ97cBYI6PoVI7wmRnc7MLS903ckhJephdklsjdf" +
                    "Y1OdBKJ4YRWTmhrR712BSl59SEwDs6uLHLUvWnA6JE6aVPkN2LJbI11QAtKzXNORWcK2ggsWqtsAzxSsdGyXCs6qs6CDxskdjfh",
            };

            try {
                const encoder = new Encoder();

                expect(() => {
                    encoder.onMesg(Profile.MesgNum.FILE_ID, fileIdMesg);
                }).toThrowError();

                const uint8Array = encoder.close();

                expect(uint8Array.length).toBe(16);
            }
            catch (error) {
                console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
                throw error;
            }
        });

        test("Can encode a short string of multibyte charactors", () => {
            const fileIdMesg = {
                productName: "中文占位符文本",
            };

            try {
                const uint8Array = encodeMesgs([{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }]);

                expect(uint8Array.length).toBe(48);
            }
            catch (error) {
                console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
                throw error;
            }
        });
        test("Encoding a multibyte string greater than 255 bytes in length throws an exception", () => {
            const fileIdMesg = {
                productName: "这是一个占位符文本，用于展示设计效果。" +
                    "这是一个占位符文本，用于展示设计效果。" +
                    "这是一个占位符文本，用于展示设计效果。" +
                    "这是一个占位符文本，用于展示设计效果。" +
                    "这是一个占位符文本，用于展示设计效果。"
            };

            try {
                const encoder = new Encoder();

                expect(() => {
                    encoder.onMesg(Profile.MesgNum.FILE_ID, fileIdMesg);
                }).toThrowError();

                const uint8Array = encoder.close();

                expect(uint8Array.length).toBe(16);
            }
            catch (error) {
                console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
                throw error;
            }
        });
    });

    describe("Can Encode Developer Data Fields", () => {
        test.for([
            [null, null],
            [null, 1],
            [1, null],
            [0, 1],
        ])("Constructing an Encoder with invalid Field Descriptions throws and exception %i and %i", ([id1, id2]) => {
            const fieldDescriptions = {
                0: {
                    developerDataIdMesg: {
                        developerDataIndex: id1,
                    },
                    fieldDescriptionMesg: {
                        developerDataIndex: id2,
                    },
                },
            };
            expect(() => {
                const encoder = new Encoder({ fieldDescriptions });
            }).toThrowError();
        });

        test.for([
            [null, null],
            [null, 1],
            [1, null],
            [0, 1],
        ])("Adding Developer Fields with invalid developerDataIndex values throws and exception %i and %i", ([id1, id2]) => {
            const developerDataIdMesg = {
                developerDataIndex: id1,
            }

            const fieldDescriptionMesg = {
                developerDataIndex: id2,
            }

            const encoder = new Encoder();

            expect(() => {
                encoder.addDeveloperField(0, developerDataIdMesg, fieldDescriptionMesg);
            }).toThrowError();

            encoder.close();
        });
    });

    test("Encoder writes base types with endianness bit", () => {
        const fileIdMesg = {
            product: 0x1234,
        }

        const uint8Array = encodeMesgs([{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }]);

        // Base type UINT16 with endianness is 0x84
        expect(uint8Array[22]).toBe(0x84);
    })

    test("Encoder writes developer data field base types with endianness bit", () => {
        const developerDataIdMesg = {
            developerDataIndex: 0,
        };

        const fieldDescriptionMesg = {
            developerDataIndex: 0,
            fieldDefinitionNumber: 1,
            fitBaseTypeId: 0x84,
        };

        const fieldDescriptions = {
            0: {
                developerDataIdMesg,
                fieldDescriptionMesg,
            },
        };

        const sessionMesg = {
            messageIndex: 2,
            developerFields: {
                0: 0x1234
            },
        };

        const mesgs = [
            { mesgNum: Profile.MesgNum.DEVELOPER_DATA_ID, mesg: developerDataIdMesg },
            { mesgNum: Profile.MesgNum.FIELD_DESCRIPTION, mesg: fieldDescriptionMesg },
            { mesgNum: Profile.MesgNum.SESSION, mesg: sessionMesg },
        ];

        const uint8Array = encodeMesgs(mesgs, { fieldDescriptions });

        // Dev data FIT Base type UINT16 with endianness is 0x84
        expect(uint8Array[43]).toBe(0x84);
    });

    test.for([
        ["uint8", 123n],
        ["uint8", "hello"],
        ["uint64", 123],
        ["uint64", "123n"],
        ["uint64", "hello"],
        ["uint64", 12.34],
    ])("Encoder throws when encoding an unexpected JavaScript type", ([fitBaseType, value]) => {
        addCustomMesgToFitProfile(DEFAULT_CUSTOM_MESG_NUM, "customMesg", {
            0: { name: "customField", type: fitBaseType, baseType: fitBaseType, },
        })

        const mesg = {
            customField: value,
        }

        expect(() => {
            encodeMesgs([{ mesgNum: DEFAULT_CUSTOM_MESG_NUM, mesg }]);
        }).toThrowError();
    });

    describe("Null and FIT Invalid Value Encoding Tests", () => {
        const FIELD_DATA_OFFSET = 24;

        const nullTestData = [
            { baseType: "uint8" },
            { baseType: "sint8" },
            { baseType: "uint16" },
            { baseType: "sint16" },
            { baseType: "uint32" },
            { baseType: "sint32" },
            { baseType: "float32" },
            { baseType: "float64" },
            { baseType: "uint8z" },
            { baseType: "uint16z" },
            { baseType: "uint32z" },
            { baseType: "byte" },
            { baseType: "sint64" },
            { baseType: "uint64" },
            { baseType: "uint64z" },
        ];

        test.for(nullTestData)(
            "Encoding $baseType with a null value throws",
            ({ baseType }) => {
                addCustomMesgToFitProfile(DEFAULT_CUSTOM_MESG_NUM, "testMesg", {
                    0: { name: "testField", type: baseType, baseType },
                });

                expect(() => encodeMesgs([{
                    mesgNum: DEFAULT_CUSTOM_MESG_NUM,
                    mesg: { testField: null },
                }])).toThrowError();
            }
        );

        const fitInvalidValueTestData = [
            { baseType: "uint8", value: 0xFF, invalidBytes: [0xFF] },
            { baseType: "sint8", value: 0x7F, invalidBytes: [0x7F] },
            { baseType: "uint16", value: 0xFFFF, invalidBytes: [0xFF, 0xFF] },
            { baseType: "sint16", value: 0x7FFF, invalidBytes: [0xFF, 0x7F] },
            { baseType: "uint32", value: 0xFFFFFFFF, invalidBytes: [0xFF, 0xFF, 0xFF, 0xFF] },
            { baseType: "sint32", value: 0x7FFFFFFF, invalidBytes: [0xFF, 0xFF, 0xFF, 0x7F] },
            { baseType: "uint8z", value: 0x00, invalidBytes: [0x00] },
            { baseType: "uint16z", value: 0x0000, invalidBytes: [0x00, 0x00] },
            { baseType: "uint32z", value: 0x00000000, invalidBytes: [0x00, 0x00, 0x00, 0x00] },
            { baseType: "byte", value: 0xFF, invalidBytes: [0xFF] },
            { baseType: "sint64", value: 0x7FFFFFFFFFFFFFFFn, invalidBytes: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F] },
            { baseType: "uint64", value: 0xFFFFFFFFFFFFFFFFn, invalidBytes: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF] },
            { baseType: "uint64z", value: 0x0000000000000000n, invalidBytes: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] },
        ];

        test.for(fitInvalidValueTestData)(
            "Encoding $baseType with the FIT invalid value writes expected invalid bytes to the byte array",
            ({ baseType, value, invalidBytes }) => {
                addCustomMesgToFitProfile(DEFAULT_CUSTOM_MESG_NUM, "testMesg", {
                    0: { name: "testField", type: baseType, baseType },
                });

                const uint8Array = encodeMesgs([{
                    mesgNum: DEFAULT_CUSTOM_MESG_NUM,
                    mesg: { testField: value },
                }]);

                const fieldBytes = Array.from(
                    uint8Array.slice(FIELD_DATA_OFFSET, FIELD_DATA_OFFSET + invalidBytes.length)
                );
                expect(fieldBytes).toEqual(invalidBytes);
            }
        );
    });
});

describe("Encoder-Decoder Integration Tests", () => {
    const DECODER_OPTIONS = {
        convertDateTimesToDates: false,
    };

    test("Can decode encoded file", () => {
        const fileIdMesg = {
            type: "activity",
            manufacturer: "development",
            product: 0,
            timeCreated: 1000000000, // Wed, 08 Sep 2021 01:46:40 GMT
            serialNumber: 1234,
        };

        try {
            const { messages, errors, } = encodeThenDecodeMesgs([{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }], { decoderOptions: DECODER_OPTIONS, });

            expect(errors.length).toBe(0);

            expect(messages.fileIdMesgs.length).toBe(1);
            expect(messages.fileIdMesgs[0]).toMatchObject(fileIdMesg);
        }
        catch (error) {
            console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
            throw error;
        }
    });

    test("Can decode encoded message with expanded component fields", () => {
        const hrMesg = {
            timestamp: 840026841,
            filteredBpm: [71, 72, 75, 77, 79, 81, 83, 83],
            eventTimestamp12: [78, 91, 230, 94, 209, 70, 64, 135, 161, 245, 28, 254],
        };

        const expectedExpandedEventTimestamps = [
            2.826171875,
            3.5986328125,
            4.341796875,
            5.1064453125,
            5.8125,
            6.5234375,
            7.2392578125,
            7.9697265625,
        ];

        try {
            const { messages, errors, } = encodeThenDecodeMesgs([{ mesgNum: Profile.MesgNum.HR, mesg: hrMesg }], { decoderOptions: DECODER_OPTIONS, });

            expect(errors.length).toBe(0);

            expect(messages.hrMesgs.length).toBe(1);

            // Decoded HR message should have expanded event timestamps
            expect(messages.hrMesgs[0].eventTimestamp).toEqual(expectedExpandedEventTimestamps);

            expect(messages.hrMesgs[0]).toMatchObject(hrMesg);
        }
        catch (error) {
            console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
            throw error;
        }
    });

    test("Encoder should round numeric, non-floating point fields with scale or offset", () => {
        const recordMesg = {
            timestamp: 1112368427,
            heartRate: 123.56,
            speed: 1.019,
            distance: 10.789,
        }

        const { messages, errors, } = encodeThenDecodeMesgs([{ mesgNum: Profile.MesgNum.RECORD, mesg: recordMesg }]);

        expect(errors.length).toBe(0);
        expect(messages.recordMesgs.length).toBe(1);

        const decodedRecordMesg = messages.recordMesgs[0];

        // An integer field with no scale or offset should be truncated
        expect(decodedRecordMesg.heartRate).toEqual(123);

        // An integer field with scale and offset should be rounded 1078.9 -(encoded)-> 1079 -(decoded)-> 10.79
        expect(decodedRecordMesg.distance).toEqual(10.79);

        expect(decodedRecordMesg.speed).toEqual(recordMesg.speed);
        expect(decodedRecordMesg.enhancedSpeed).toEqual(recordMesg.speed);
    });

    test("Encoder should correctly apply scale and offset to fields with singular expanded components", () => {
        const recordMesg = {
            heartRate: 55,
            altitude: 100,
            speed: 1.5
        }

        try {
            const { messages, errors, } = encodeThenDecodeMesgs([{ mesgNum: Profile.MesgNum.RECORD, mesg: recordMesg }]);

            expect(errors.length).toBe(0);
            expect(messages.recordMesgs.length).toBe(1);

            expect(messages.recordMesgs[0]).toMatchObject({
                heartRate: recordMesg.heartRate,
                altitude: recordMesg.altitude,
                speed: recordMesg.speed,
            });
        }
        catch (error) {
            console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
            throw error;
        }
    });

    test("Encoder should correctly encode and decode fields and developer fields with mulitbyte base types", () => {
        const developerDataIdMesg = {
            developerDataIndex: 0,
        };

        const fieldDescriptionMesg = {
            developerDataIndex: 0,
            fieldDefinitionNumber: 1,
            fitBaseTypeId: 0x84,
        };

        const fileIdMesg = {
            product: 0x5555,
            developerFields: {
                0: 0x1234
            },
        };

        const fieldDescriptions = {
            0: {
                developerDataIdMesg,
                fieldDescriptionMesg,
            },
        };

        const mesgs = [
            { mesgNum: Profile.MesgNum.DEVELOPER_DATA_ID, mesg: developerDataIdMesg, },
            { mesgNum: Profile.MesgNum.FIELD_DESCRIPTION, mesg: fieldDescriptionMesg, },
            { mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg, },
        ];

        const { messages, errors, } = encodeThenDecodeMesgs(mesgs, { fieldDescriptions, decoderOptions: DECODER_OPTIONS, });

        expect(errors.length).toBe(0);
        expect(messages.fileIdMesgs.length).toBe(1);

        const decodedFileIdMesg = messages.fileIdMesgs[0];
        expect(decodedFileIdMesg.product).toBe(fileIdMesg.product);
        expect(decodedFileIdMesg.developerFields[0]).toBe(fileIdMesg.developerFields[0]);
    });

    test.for([
        { mesg: "weightScale", field: "weight", value: 12.34, expectedValue: 12.34 },
        { mesg: "deviceInfo", field: "deviceIndex", value: "creator", expectedValue: "creator" },
        { mesg: "session", field: "messageIndex", value: "mask", expectedValue: "mask" },
    ])("Non-enum fields round-trip correctly: $mesg.$field", ({ mesg, field, value, expectedValue }) => {
        const mesgNumKey = mesg.replace(/([A-Z])/g, "_$1").toUpperCase();
        const { messages, errors } = encodeThenDecodeMesgs(
            [{ mesgNum: Profile.MesgNum[mesgNumKey], mesg: { [field]: value } }],
        );

        expect(errors.length).toBe(0);

        expect(messages[`${mesg}Mesgs`][0][field]).toBe(expectedValue);
    });

    test("Can encode a datetime field with a JavaScript Date object", () => {
        const date = new Date(Date.UTC(2024, 5, 15, 12, 0, 0)); // 2024-06-15T12:00:00Z
        const expectedTimestamp = (date.getTime() - Utils.FIT_EPOCH_MS) / 1000;

        const fileIdMesg = {
            type: 4,
            manufacturer: 1,
            timeCreated: date,
        };

        const { messages, errors } = encodeThenDecodeMesgs(
            [{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }],
            { decoderOptions: DECODER_OPTIONS }
        );

        expect(errors.length).toBe(0);
        expect(messages.fileIdMesgs[0].timeCreated).toBe(expectedTimestamp);
    });

    test("Encoding an ISO datetime string returns FIT Epoch", () => {
        const encoder = new Encoder();

        const fileIdMesg = {
            type: 4,
            timeCreated: "2021-09-21T01:46:40",
        };

        const { messages, errors } = encodeThenDecodeMesgs(
            [{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }],
            { decoderOptions: DECODER_OPTIONS }
        );

        expect(errors.length).toBe(0);
        expect(messages.fileIdMesgs[0].timeCreated).toBe(0);
    });

    test("Fields not in the profile should be ignored by the encoder", () => {
        const fileIdMesg = {
            type: 4,
            manufacturer: 1,
            unknownField1: 123,
            unknownField2: "test",
        };

        const { messages, errors } = encodeThenDecodeMesgs(
            [{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }],
            { decoderOptions: DECODER_OPTIONS }
        );

        expect(errors.length).toBe(0);
        const fileId = messages.fileIdMesgs[0];
        expect(fileId).toHaveProperty("type");
        expect(fileId).toHaveProperty("manufacturer");
        expect(fileId).not.toHaveProperty("unknownField1");
        expect(fileId).not.toHaveProperty("unknownField2");
    });

    test("Subfields with main field should be ignored by the encoder", () => {
        const fileIdMesg = {
            manufacturer: "development",
            product: 4440,
            garminProduct: "edge1050", // subfield — ignored by the encoder
        };

        const { messages, errors } = encodeThenDecodeMesgs(
            [{ mesgNum: Profile.MesgNum.FILE_ID, mesg: fileIdMesg }],
            { decoderOptions: DECODER_OPTIONS }
        );

        expect(errors.length).toBe(0);
        const fileId = messages.fileIdMesgs[0];
        expect(fileId.product).toBe(fileIdMesg.product);
        expect(fileId).not.toHaveProperty("garminProduct");
    });

    describe("Base Type Encode-Decode Tests", () => {
        const arrayTestData = [
            { baseType: "uint8", values: [12, 34, 56] },
            { baseType: "uint16", values: [12345, 54321] },
            { baseType: "uint32", values: [1234567890, 987654321] },
            { baseType: "sint8", values: [-123, -12] },
            { baseType: "sint16", values: [-12345, -5432] },
            { baseType: "sint32", values: [-123456789, -98765432] },
            { baseType: "float32", values: [123.4, 432.1] },
            { baseType: "float64", values: [123456.789012, 210987.654321] },
            { baseType: "uint8z", values: [200, 150] },
            { baseType: "uint16z", values: [60000, 30000] },
            { baseType: "uint32z", values: [4000000000, 2000000000] },
            { baseType: "byte", values: [0xDE, 0xAD] },
            { baseType: "byte", values: [0xFF, 0xAB, 0xFF] },
            { baseType: "sint64", values: [-12345678901234n, -43210987654321n] },
            { baseType: "uint64", values: [12345678901234n, 43210987654321n] },
            { baseType: "uint64z", values: [12345678901234n, 43210987654321n] },
        ];

        const stringFieldTestData = [
            { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: true } },
            { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: false } },
            { baseType: "string", values: ["Test String 1"], fieldProperties: { array: false } },
            { baseType: "string", values: "Test String 1", fieldProperties: { array: false } },
        ];

        const scaleTestData = [
            { baseType: "uint8", values: 123, fieldProperties: { scale: 2 } },
            { baseType: "uint16", values: 12345, fieldProperties: { scale: 2 } },
            { baseType: "uint32", values: 1234567890, fieldProperties: { scale: 2 } },
            { baseType: "sint8", values: -12, fieldProperties: { scale: 2 } },
            { baseType: "sint16", values: -12345, fieldProperties: { scale: 2 } },
            { baseType: "sint32", values: -123456789, fieldProperties: { scale: 2 } },
            { baseType: "float32", values: 123.4, fieldProperties: { scale: 2 } },
            { baseType: "float64", values: 123456.789012, fieldProperties: { scale: 2 } },
        ];

        const offsetTestData = [
            { baseType: "uint8", values: 123, fieldProperties: { offset: 2 } },
            { baseType: "uint16", values: 12345, fieldProperties: { offset: 2 } },
            { baseType: "uint32", values: 1234567890, fieldProperties: { offset: 2 } },
            { baseType: "sint8", values: -123, fieldProperties: { offset: 2 } },
            { baseType: "sint16", values: -12345, fieldProperties: { offset: 2 } },
            { baseType: "sint32", values: -123456789, fieldProperties: { offset: 2 } },
            { baseType: "string", values: "Test String", fieldProperties: { offset: 2 } },
            { baseType: "float32", values: 123.4, fieldProperties: { offset: 2 } },
            { baseType: "float64", values: 123456.789012, fieldProperties: { offset: 2 } },
            { baseType: "uint8z", values: 200, fieldProperties: { offset: 2 } },
            { baseType: "uint16z", values: 60000, fieldProperties: { offset: 2 } },
            { baseType: "uint32z", values: 4000000000, fieldProperties: { offset: 2 } },
            { baseType: "byte", values: 0xDE, fieldProperties: { offset: 2 } },
        ];

        const scaleOffset64bitTestData = [
            { baseType: "sint64", values: -100n, offset: 2, expectedValue: -98n },
            { baseType: "uint64", values: 100n, offset: 2, expectedValue: 102n },
            { baseType: "uint64z", values: 100n, offset: 2, expectedValue: 102n },
            { baseType: "sint64", values: -500n, scale: 2, expectedValue: -1000n },
            { baseType: "uint64", values: 100n, scale: 2, expectedValue: 200n },
            { baseType: "uint64z", values: 100n, scale: 2, expectedValue: 200n },
            { baseType: "uint64", values: 123.45, scale: 100, expectedValue: 12345n },
        ];

        const stringNumericValueTestData = [
            { baseType: "uint8", value: "123", expectedValue: 123 },
            { baseType: "float32", value: "123.456", expectedValue: 123.456 },
            { baseType: "float64", value: "123456.789012", expectedValue: 123456.789012 },
            { baseType: "uint64", value: "12345678901234", expectedValue: 12345678901234n },
            { baseType: "sint64", value: "-12345678901234", expectedValue: -12345678901234n },
            { baseType: "uint64", value: "1234567890123456789012345678901234567890", expectedValue: 12446928571455179474n },
        ];

        const overflowMaskTestData = [
            { baseType: "uint8", value: 0x1234, expectedValue: 0x34 },
            { baseType: "sint8", value: 0x12FF, expectedValue: -1 },
            { baseType: "uint8z", value: 0x1234, expectedValue: 0x34 },
            { baseType: "uint16", value: 0x123456, expectedValue: 0x3456 },
            { baseType: "sint16", value: 0x12FFFF, expectedValue: -1 },
            { baseType: "uint16z", value: 0x123456, expectedValue: 0x3456 },
            { baseType: "uint32", value: 0x1234567899, expectedValue: 0x34567899 },
            { baseType: "sint32", value: 0x12FFFFFFFF, expectedValue: -1 },
            { baseType: "uint32z", value: 0x1234567899, expectedValue: 0x34567899 },
            { baseType: "byte", value: 0x1234, expectedValue: 0x34 },
            { baseType: "uint64", value: 0x12FFFFFFFFFFFFFFFFFFFFFFFFFn, expectedValue: 0xFFFFFFFFFFFFFFFFn },
            { baseType: "uint64z", value: 0x12FFFFFFFFFFFFFFFFFFFFFFFFFFn, expectedValue: 0xFFFFFFFFFFFFFFFFn },
            { baseType: "sint64", value: 0x12FFFFFFFFFFFFFFFFFFFFFFFFFFFFn, expectedValue: -1n },
        ];

        const developerFieldTestData = [
            { baseType: "uint8", values: 123, },
            { baseType: "uint16", values: 12345, },
            { baseType: "uint32", values: 1234567890, },
            { baseType: "sint8", values: -123, },
            { baseType: "sint16", values: -12345, },
            { baseType: "sint32", values: -123456789, },
            { baseType: "string", values: "Test String", },
            { baseType: "float32", values: 123.456, },
            { baseType: "float64", values: 123456.789012, },
            { baseType: "uint8z", values: 200, },
            { baseType: "uint16z", values: 60000, },
            { baseType: "uint32z", values: 4000000000, },
            { baseType: "byte", values: 0xDE, },
            { baseType: "sint64", values: -12345678901234n, },
            { baseType: "uint64", values: 12345678901234n, },
            { baseType: "uint64z", values: 12345678901234n, },
            { baseType: "uint8", values: [12, 34, 56], fieldProperties: { array: true } },
            { baseType: "uint16", values: [12345, 54321], fieldProperties: { array: true } },
            { baseType: "uint32", values: [1234567890, 987654321], fieldProperties: { array: true } },
            { baseType: "sint8", values: [-123, -12], fieldProperties: { array: true } },
            { baseType: "sint16", values: [-12345, -5432], fieldProperties: { array: true } },
            { baseType: "sint32", values: [-123456789, -98765432], fieldProperties: { array: true } },
            { baseType: "float32", values: [123.4, 432.1], fieldProperties: { array: true } },
            { baseType: "float64", values: [123456.789012, 210987.654321], fieldProperties: { array: true } },
            { baseType: "uint8z", values: [200, 150], fieldProperties: { array: true } },
            { baseType: "uint16z", values: [60000, 30000], fieldProperties: { array: true } },
            { baseType: "uint32z", values: [4000000000, 2000000000], fieldProperties: { array: true } },
            { baseType: "byte", values: [0xDE, 0xAD], fieldProperties: { array: true } },
            { baseType: "sint64", values: [-12345678901234n, -43210987654321n], fieldProperties: { array: true } },
            { baseType: "uint64", values: [12345678901234n, 43210987654321n], fieldProperties: { array: true } },
            { baseType: "uint64z", values: [12345678901234n, 43210987654321n], fieldProperties: { array: true } },
            { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: true } },
            { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: false } },
        ];

        // MARK: LegacyArrayMode Tests
        describe("LegacyArrayMode Tests", () => {
            test.for([
                { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: true } },
                { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: false } },
                ...arrayTestData.map(({ baseType, values }) => ({ baseType, values, fieldProperties: { array: true } })),
                ...arrayTestData.map(({ baseType, values }) => ({ baseType, values, fieldProperties: { array: false } })),
            ])("Legacy Encode-Decode $baseType when array is $fieldProperties.array", ({ baseType, values, fieldProperties = {} }) => {
                const { messages, errors } = encodeDecodeFieldMesg(baseType, values, fieldProperties, { legacyArrayMode: true });
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, messages.testMesgMesgs[0].testField);
            });

            test.for(stringFieldTestData)("Legacy Encode-Decode string field", ({ baseType, values, fieldProperties = {} }) => {
                const { messages, errors } = encodeDecodeFieldMesg(baseType, values, fieldProperties, { legacyArrayMode: true });
                expect(errors.length).toBe(0);
                expect(messages.testMesgMesgs[0].testField).toEqual(values?.length === 1 ? values[0] : values);
            });

            test.for(developerFieldTestData)("Legacy Encode-Decode developer field with base type $baseType array: $fieldProperties.array", ({ baseType, values, fieldProperties = {} }) => {
                const { errors, actualValue } = encodeDecodeDevField(baseType, values, fieldProperties, { legacyArrayMode: false });
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, actualValue);
            });

            test.for([
                { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: true } },
                { baseType: "string", values: ["Test String 1", "Test String 2"], fieldProperties: { array: false } },
                { baseType: "string", values: "Test String 1", fieldProperties: { array: false } },
                { baseType: "uint8", values: [12, 34, 56], fieldProperties: { array: true } },
                { baseType: "uint8", values: [12, 34, 56], fieldProperties: { array: false } },
            ])("Legacy Encode-Decode developer field does not truncate $baseType non-profile arrays", ({ baseType, values, fieldProperties = {} }) => {
                const { errors, actualValue } = encodeDecodeDevField(baseType, values, fieldProperties, { legacyArrayMode: true });
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, actualValue);
            });
        });

        // MARK: String Tests
        test.for(stringFieldTestData)("Encode-Decode string field", ({ baseType, values, fieldProperties = {} }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, values, fieldProperties);
            expect(errors.length).toBe(0);
            expect(messages.testMesgMesgs[0].testField).toBe(Array.isArray(values) ? values[0] : values);
        });

        // MARK: Array Tests
        test.for([
            ...arrayTestData.map(({ baseType, values }) => ({ baseType, values, fieldProperties: { array: true } })),
            ...arrayTestData.map(({ baseType, values }) => ({ baseType, values, fieldProperties: { array: false } })),
        ])("Encode-Decode $baseType when array is $fieldProperties.array", ({ baseType, values, fieldProperties = {} }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, values, fieldProperties);
            expect(errors.length).toBe(0);
            const expectedValues = fieldProperties.array ? values : values[0];
            expectValuesEqualGivenBaseType(baseType, expectedValues, messages.testMesgMesgs[0].testField);
        });

        // MARK: Scale Tests
        test.for(scaleTestData)("Encode-Decode $baseType with scale", ({ baseType, values, fieldProperties }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, values, fieldProperties);
            expect(errors.length).toBe(0);
            expectValuesEqualGivenBaseType(baseType, values, messages.testMesgMesgs[0].testField);
        });

        // MARK: Offset Tests
        test.for(offsetTestData)("Encode-Decode $baseType with offset", ({ baseType, values, fieldProperties = {} }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, values, fieldProperties);
            expect(errors.length).toBe(0);
            expectValuesEqualGivenBaseType(baseType, values, messages.testMesgMesgs[0].testField);
        });

        // MARK: 64 bit Scale/Offset Tests (Decoder Scale/Offset not applied)
        test.for(scaleOffset64bitTestData)("Encode-Decode 64bit type $baseType does not apply scale/offset", ({ baseType, values, scale, offset, expectedValue }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, values, { scale, offset });
            expect(errors.length).toBe(0);
            expectValuesEqualGivenBaseType(baseType, expectedValue, messages.testMesgMesgs[0].testField);
        });

        // MARK: Integer Fields Scale Rounding Tests
        test.for([
            { baseType: "uint8", value: 12.21, scale: 10, expectedValue: 12.2 },
            { baseType: "uint8", value: 12.77, scale: 10, expectedValue: 12.8 },
            { baseType: "uint8", value: 12.5, scale: 10, expectedValue: 12.5 },
        ])("Encode-Decode integer $baseType with scale rounds to nearest value", ({ baseType, value, scale, expectedValue }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, value, { scale });
            expect(errors.length).toBe(0);
            expectValuesEqualGivenBaseType(baseType, expectedValue, messages.testMesgMesgs[0].testField);
        });

        // MARK: String Numeric Value Tests
        test.for(stringNumericValueTestData)("Encode-Decode $baseType with string numeric value", ({ baseType, value, expectedValue }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, value);
            expect(errors.length).toBe(0);
            expectValuesEqualGivenBaseType(baseType, expectedValue, messages.testMesgMesgs[0].testField);
        });

        // MARK: Overflow Mask Tests
        test.for(overflowMaskTestData)("Encode-Decode $baseType with overflow value applies overflow mask", ({ baseType, value, expectedValue }) => {
            const { messages, errors } = encodeDecodeFieldMesg(baseType, value);
            expect(errors.length).toBe(0);
            expectValuesEqualGivenBaseType(baseType, expectedValue, messages.testMesgMesgs[0].testField);
        });

        // MARK: Developer Field Tests
        describe("Developer Field Tests", () => {
            test.for(developerFieldTestData)("Encode-Decode developer field with base type $baseType array: $fieldProperties.array", ({ baseType, values, fieldProperties = {} }) => {
                const { errors, actualValue } = encodeDecodeDevField(baseType, values, fieldProperties);
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, actualValue);
            });

            test.for(arrayTestData)("Encode-Decode developer field $baseType non-profile arrays are not truncated", ({ baseType, values, fieldProperties = {} }) => {
                const { errors, actualValue } = encodeDecodeDevField(baseType, values, fieldProperties);
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, actualValue);
            });

            test.for([
                { baseType: "string", values: ["Test String 1", "Test String 2"] },
                ...arrayTestData,
            ])("LegacyArrayMode - Encoding developer array field of base type: $baseType preserves array", ({ baseType, values, fieldProperties = {} }) => {
                const { errors, actualValue } = encodeDecodeDevField(baseType, values, fieldProperties, { legacyArrayMode: true });
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, actualValue);
            });

            test.for([
                { baseType: "string", values: ["Test String 1", "Test String 2"] },
                ...arrayTestData,
            ])("Encoding developer array field of base type: $baseType preserves array", ({ baseType, values, fieldProperties = {} }) => {
                const { errors, actualValue } = encodeDecodeDevField(baseType, values, fieldProperties);
                expect(errors.length).toBe(0);
                expectValuesEqualGivenBaseType(baseType, values, actualValue);
            });
        });
    });
});

const expectValuesEqualGivenBaseType = (fitBaseType, expectedValues, actualValues) => {
    const isExpectedArray = Array.isArray(expectedValues);

    expect(Array.isArray(actualValues)).toBe(isExpectedArray);

    if (!isExpectedArray) {
        (fitBaseType === "string" || typeof expectedValues === "bigint") ?
            expect(actualValues).toEqual(expectedValues) :
            expect(actualValues).toBeCloseTo(expectedValues, 2);
        return;
    }

    expect(actualValues.length).toBe(expectedValues.length);

    expectedValues.forEach((expected, index) => {
        const actual = actualValues[index];

        (fitBaseType === "string" || typeof expected === "bigint") ?
            expect(actual).toEqual(expected) :
            expect(actual).toBeCloseTo(expected, 2);
    });
};

const encodeDecodeFieldMesg = (baseType, value, fieldProperties = {}, { legacyArrayMode = false } = {}) => {
    addCustomMesgToFitProfile(DEFAULT_CUSTOM_MESG_NUM, "testMesg", {
        0: { name: "testField", type: baseType, baseType, ...fieldProperties, },
    });
    const { messages, errors, } = encodeThenDecodeMesgs(
        [{ mesgNum: DEFAULT_CUSTOM_MESG_NUM, mesg: { testField: value } }],
        { decoderOptions: { legacyArrayMode } },
    );
    return { messages, errors };
};

const encodeDecodeDevField = (baseType, value, fieldProperties = {}, { legacyArrayMode = false } = {}) => {
    const DEV_FIELD_KEY = 0;
    const developerDataIdMesg = {
        applicationId: Array(16).fill(0),
        applicationVersion: 1,
        developerDataIndex: 0,
    };
    const fieldDescriptionMesg = {
        developerDataIndex: 0,
        fieldDefinitionNumber: 0,
        fitBaseTypeId: Utils.FieldTypeToBaseType[baseType],
        fieldName: "Test Field",
        units: "units",
        nativeMesgNum: Profile.MesgNum.SESSION,
        array: Number(fieldProperties.array || false),
    };
    const fieldDescriptions = { [DEV_FIELD_KEY]: { developerDataIdMesg, fieldDescriptionMesg } };
    const mesgs = [
        { mesgNum: Profile.MesgNum.DEVELOPER_DATA_ID, mesg: developerDataIdMesg, },
        { mesgNum: Profile.MesgNum.FIELD_DESCRIPTION, mesg: fieldDescriptionMesg, },
        { mesgNum: Profile.MesgNum.SESSION, mesg: { messageIndex: 0, sport: "running", developerFields: { [DEV_FIELD_KEY]: value } }, },
    ];
    const { messages, errors, } = encodeThenDecodeMesgs(mesgs, { fieldDescriptions, decoderOptions: { legacyArrayMode } });
    return { messages, errors, actualValue: messages.sessionMesgs?.[0]?.developerFields?.[DEV_FIELD_KEY] };
};



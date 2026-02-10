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

    describe("Base Type Encode-Decode Tests", () => {
        test.for([
            ["uint8", 123, 123],
            ["uint16", 12345, 12345],
            ["uint32", 1234567890, 1234567890],
            ["sint8", -123, -123],
            ["sint16", -12345, -12345],
            ["sint32", -123456789, -123456789],
            ["string", "Test String", "Test String"],
            ["float32", 123.4, 123.4],
            ["float64", 123456.789012, 123456.789012],
            ["uint8z", 200, 200],
            ["uint16z", 60000, 60000],
            ["uint32z", 4000000000, 4000000000],
            ["byte", 0xDE, 0xDE],
            ["sint64", -12345678901234n, -12345678901234n],
            ["uint64", 12345678901234n, 12345678901234n],
            ["uint64z", 12345678901234n, 12345678901234n],
            // Offset Tests
            ["uint8", 123, 123, { offset: 2 }],
            ["uint16", 12345, 12345, { offset: 2 }],
            ["uint32", 1234567890, 1234567890, { offset: 2 }],
            ["sint8", -123, -123, { offset: 2 }],
            ["sint16", -12345, -12345, { offset: 2 }],
            ["sint32", -123456789, -123456789, { offset: 2 }],
            ["string", "Test String", "Test String", { offset: 2 }],
            ["float32", 123.4, 123.4, { offset: 2 }],
            ["float64", 123456.789012, 123456.789012, { offset: 2 }],
            ["uint8z", 200, 200, { offset: 2 }],
            ["uint16z", 60000, 60000, { offset: 2 }],
            ["uint32z", 4000000000, 4000000000, { offset: 2 }],
            ["byte", 0xDE, 0xDE, { offset: 2 }],
            // Scale Tests
            ["uint8", 123, 123, { scale: 2 }],
            ["uint16", 12345, 12345, { scale: 2 }],
            ["uint32", 1234567890, 1234567890, { scale: 2 }],
            ["sint8", -12, -12, { scale: 2 }],
            ["sint16", -1234, -1234, { scale: 2 }],
            ["sint32", -12345, -12345, { scale: 2 }],
            ["string", "Test String", "Test String", { scale: 2 }],
            ["float32", 123.4, 123.4, { scale: 2 }],
            ["float64", 123456.789012, 123456.789012, { scale: 2 }],
            ["uint8z", 123, 123, { scale: 2 }],
            ["uint16z", 1234, 1234, { scale: 2 }],
            ["uint32z", 12345, 12345, { scale: 2 }],
            ["byte", 0x01, 0x01, { scale: 2 }],
            // 64 bit Scale/Offset Tests (Decoder Scale/Offset not applied)
            ["sint64", -100n, -98n, { offset: 2 }],
            ["uint64", 100n, 102n, { offset: 2 }],
            ["uint64z", 100n, 102n, { offset: 2 }],
            ["sint64", -500n, -1000n, { scale: 2 }],
            ["uint64", 100n, 200n, { scale: 2 }],
            ["uint64z", 100n, 200n, { scale: 2 }],
            ["uint64", 123.45, 12345n, { scale: 100 }],
            // Integer Fields Scale Rounding Tests
            ["uint8", 12.21, 12.2, { scale: 10 }],
            ["uint8", 12.77, 12.8, { scale: 10 }],
            ["uint8", 12.5, 12.5, { scale: 10 }],
            // String Numeric Value Tests
            ["uint8", "123", 123],
            ["float32", "123.456", 123.456],
            ["float64", "123456.789012", 123456.789012],
            ["uint64", "12345678901234", 12345678901234n],
            ["sint64", "-12345678901234", -12345678901234n],
            ["uint64", "1234567890123456789012345678901234567890", 12446928571455179474n],
            // Overflow Mask Tests
            ["uint8", 0x1234, 0x34],
            ["sint8", 0x12FF, -1],
            ["uint8z", 0x1234, 0x34],
            ["uint16", 0x123456, 0x3456],
            ["sint16", 0x12FFFF, -1],
            ["uint16z", 0x123456, 0x3456],
            ["uint32", 0x1234567899, 0x34567899],
            ["sint32", 0x12FFFFFFFF, -1],
            ["uint32z", 0x1234567899, 0x34567899],
            ["byte", 0x1234, 0x34],
            ["uint64", 0x12FFFFFFFFFFFFFFFFFFFFFFFFFn, 0xFFFFFFFFFFFFFFFFn],
            ["uint64z", 0x12FFFFFFFFFFFFFFFFFFFFFFFFFFn, 0xFFFFFFFFFFFFFFFFn],
            ["sint64", 0x12FFFFFFFFFFFFFFFFFFFFFFFFFFFFn, -1n],
        ])("Encoding field of base type: %s %#", ([fitBaseType, value, expectedValue, { scale = 1, offset = 0 } = {}]) => {

            addCustomMesgToFitProfile(DEFAULT_CUSTOM_MESG_NUM, "testMesg", {
                0: { name: "testField", type: fitBaseType, baseType: fitBaseType, scale, offset, },
            })

            const testMesg = {
                testField: value,
            }

            const { messages, errors, } = encodeThenDecodeMesgs([{ mesgNum: DEFAULT_CUSTOM_MESG_NUM, mesg: testMesg }]);

            expect(errors.length).toBe(0);
            const mesg = messages.testMesgMesgs[0];

            (fitBaseType === "string" || typeof mesg.testField === "bigint")
                ? expect(mesg.testField).toBe(expectedValue)
                : expect(mesg.testField).toBeCloseTo(expectedValue, 2);
        });

        test.for([
            ["uint8", 123],
            ["uint16", 12345],
            ["uint32", 1234567890],
            ["sint8", -123],
            ["sint16", -12345],
            ["sint32", -123456789],
            ["string", "Test String"],
            ["float32", 123.456],
            ["float64", 123456.789012],
            ["uint8z", 200],
            ["uint16z", 60000],
            ["uint32z", 4000000000],
            ["byte", 0xDE],
            ["sint64", -12345678901234n],
            ["uint64", 12345678901234n],
            ["uint64z", 12345678901234n],
        ])("Encoding developer field of base type: %s", ([fitBaseType, expectedValue]) => {
            const DEV_FIELD_KEY = 0;

            const developerDataIdMesg = {
                applicationId: Array(16).fill(0),
                applicationVersion: 1,
                developerDataIndex: 0,
            };

            const fieldDescriptionMesg = {
                developerDataIndex: 0,
                fieldDefinitionNumber: 0,
                fitBaseTypeId: Utils.FieldTypeToBaseType[fitBaseType],
                fieldName: "Test Field",
                units: "units",
                nativeMesgNum: Profile.MesgNum.SESSION,
            };

            const fieldDescriptions = {
                [DEV_FIELD_KEY]: {
                    developerDataIdMesg,
                    fieldDescriptionMesg,
                },
            };

            const sessionMesg = {
                messageIndex: 0,
                sport: "running",
                developerFields: {
                    [DEV_FIELD_KEY]: expectedValue,
                },
            }

            const mesgs = [
                { mesgNum: Profile.MesgNum.DEVELOPER_DATA_ID, mesg: developerDataIdMesg, },
                { mesgNum: Profile.MesgNum.FIELD_DESCRIPTION, mesg: fieldDescriptionMesg, },
                { mesgNum: Profile.MesgNum.SESSION, mesg: sessionMesg, },
            ];

            const { messages, errors, } = encodeThenDecodeMesgs(mesgs, { fieldDescriptions, });

            expect(errors.length).toBe(0);
            expect(messages.sessionMesgs.length).toBe(1);

            const actualValue = messages.sessionMesgs[0].developerFields[DEV_FIELD_KEY];

            (fitBaseType === "string" || typeof actualValue === "bigint")
                ? expect(actualValue).toBe(expectedValue)
                : expect(actualValue).toBeCloseTo(expectedValue, 2);
        });
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2025 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import { Profile, Encoder, Stream, Decoder } from "../src/index.js";

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
                const encoder = new Encoder();
                encoder.onMesg(Profile.MesgNum.FILE_ID, fileIdMesg);
                const uint8Array = encoder.close();

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
                const encoder = new Encoder();
                encoder.onMesg(Profile.MesgNum.FILE_ID, fileIdMesg);
                const uint8Array = encoder.close();

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
            const encoder = new Encoder();
            encoder.onMesg(Profile.MesgNum.FILE_ID, fileIdMesg);
            const stream = Stream.fromByteArray(encoder.close());

            const decoder = new Decoder(stream);

            const { messages, errors, } = decoder.read(DECODER_OPTIONS);

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
            const encoder = new Encoder();
            encoder.onMesg(Profile.MesgNum.HR, hrMesg);
            const stream = Stream.fromByteArray(encoder.close());

            const decoder = new Decoder(stream);

            const { messages, errors, } = decoder.read(DECODER_OPTIONS);

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

        const encoder = new Encoder();
        encoder.onMesg(Profile.MesgNum.RECORD, recordMesg);

        const stream = Stream.fromByteArray(encoder.close());

        const decoder = new Decoder(stream);

        const { messages, errors, } = decoder.read(DECODER_OPTIONS);

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
            const encoder = new Encoder();
            encoder.onMesg(Profile.MesgNum.RECORD, recordMesg);
            const uint8Array = encoder.close();

            const decoder = new Decoder(Stream.fromByteArray(uint8Array));
            const { messages, errors, } = decoder.read();

            expect(errors.length).toBe(0);
            expect(messages.recordMesgs.length).toBe(1);

            expect(messages.recordMesgs[0]).toMatchObject(recordMesg);
        }
        catch (error) {
            console.error(`${error.name}: ${error.message} \n${JSON.stringify(error.cause, null, 3)}`);
            throw error;
        }
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2025 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import { Encoder, Profile } from "../src/index.js";

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

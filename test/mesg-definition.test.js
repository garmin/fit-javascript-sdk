/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import { describe, expect, test } from "vitest";
import FIT from "../src/fit.js";
import MesgDefinition from "../src/mesg-definition.js";
import Profile from "../src/profile.js";

describe("MesgDefinition", () => {
    test("Creates a file_id definition with correct global message number and field count", () => {
        const mesg = { type: 4, manufacturer: 1, };
        const mesgDef = new MesgDefinition(Profile.MesgNum.FILE_ID, mesg);

        expect(mesgDef.globalMessageNumber).toBe(Profile.MesgNum.FILE_ID);
        expect(mesgDef.fieldDefinitions.length).toBe(2);
    });

    test("Throws on null mesg", () => {
        expect(() => {
            new MesgDefinition(Profile.MesgNum.FILE_ID, null);
        }).toThrowError("Could not construct MesgDefinition from Message");
    });

    test("Throws on null mesgNum", () => {
        expect(() => {
            new MesgDefinition(null, { type: 4, });
        }).toThrowError("Could not construct MesgDefinition from Message");
    });

    test("Throws on invalid mesgNum", () => {
        expect(() => {
            new MesgDefinition(999999, { type: 4, });
        }).toThrowError("Could not construct MesgDefinition from Message");
    });

    test("Throws when no valid fields are found", () => {
        expect(() => {
            new MesgDefinition(Profile.MesgNum.FILE_ID, { nonexistentField: 123, });
        }).toThrowError("Could not construct MesgDefinition from Message");
    });

    const developerDataIdMesg = { developerDataIndex: 0, };
    const developerFieldDescriptions = {
        fieldDescriptions: {
            alpha: {
                developerDataIdMesg,
                fieldDescriptionMesg: {
                    developerDataIndex: 0,
                    fieldDefinitionNumber: 0,
                    fitBaseTypeId: FIT.BaseType.UINT8,
                },
            },
            beta: {
                developerDataIdMesg,
                fieldDescriptionMesg: {
                    developerDataIndex: 0,
                    fieldDefinitionNumber: 1,
                    fitBaseTypeId: FIT.BaseType.UINT8,
                },
            },
        },
    };

    test.for([
        {
            name: "returns true for the same definition",
            first: [Profile.MesgNum.FILE_ID, { type: 4, manufacturer: 1, }],
            second: [Profile.MesgNum.FILE_ID, { type: 4, manufacturer: 1, }],
            expected: true,
        },
        {
            name: "returns true when fields match but order is different",
            first: [Profile.MesgNum.FILE_ID, { manufacturer: 1, type: 4, }],
            second: [Profile.MesgNum.FILE_ID, { type: 1, manufacturer: 4, }],
            expected: true,
        },
        {
            name: "returns false for different fields",
            first: [Profile.MesgNum.FILE_ID, { type: 4, manufacturer: 1, }],
            second: [Profile.MesgNum.FILE_ID, { type: 4, }],
            expected: false,
        },
        {
            name: "returns false for different message types",
            first: [Profile.MesgNum.FILE_ID, { type: 4, }],
            second: [Profile.MesgNum.FILE_CREATOR, { softwareVersion: 100, }],
            expected: false,
        },
        {
            name: "returns true for developer fields in the same order",
            first: [Profile.MesgNum.FILE_ID, { type: 4, developerFields: { alpha: 1, beta: 2, }, }, developerFieldDescriptions],
            second: [Profile.MesgNum.FILE_ID, { type: 4, developerFields: { alpha: 3, beta: 4, }, }, developerFieldDescriptions],
            expected: true,
        },
        {
            name: "returns true for developer fields in a different order",
            first: [Profile.MesgNum.FILE_ID, { type: 4, developerFields: { alpha: 1, beta: 2, }, }, developerFieldDescriptions],
            second: [Profile.MesgNum.FILE_ID, { type: 4, developerFields: { beta: 4, alpha: 3, }, }, developerFieldDescriptions],
            expected: true,
        },
    ])("Equals $name", ({ first, second, expected, }) => {
        const firstDefinition = new MesgDefinition(...first);
        const secondDefinition = new MesgDefinition(...second);

        expect(firstDefinition.equals(secondDefinition)).toBe(expected);
    });

    test("Skips null values", () => {
        const mesg = { type: 4, manufacturer: null, };
        const mesgDef = new MesgDefinition(Profile.MesgNum.FILE_ID, mesg);

        expect(mesgDef.fieldDefinitions.length).toBe(1);
    });

    test("String field size includes null terminator", () => {
        const mesg = { type: 4, productName: "TestDevice", };
        const mesgDef = new MesgDefinition(Profile.MesgNum.FILE_ID, mesg);

        const stringFd = mesgDef.fieldDefinitions.find((fd) => fd.name === "productName");
        const expectedSize = new TextEncoder().encode("TestDevice").length + 1;

        expect(stringFd.size).toBe(expectedSize);
    });

    test("Throws on oversized field", () => {
        const mesg = { type: 4, productName: "A".repeat(255), };

        expect(() => {
            new MesgDefinition(Profile.MesgNum.FILE_ID, mesg);
        }).toThrowError("Could not construct MesgDefinition from Message");
    });

    test("Throws on oversized developer field", () => {
        const devId = { developerDataIndex: 0, };
        const fieldDesc = {
            developerDataIndex: 0,
            fieldDefinitionNumber: 0,
            fitBaseTypeId: FIT.BaseType.UINT8,
        };
        const fieldDescriptions = {
            0: { developerDataIdMesg: devId, fieldDescriptionMesg: fieldDesc, },
        };
        const mesg = { type: 4, developerFields: { 0: new Array(FIT.MAX_FIELD_SIZE + 1).fill(0), }, };

        expect(() => {
            new MesgDefinition(Profile.MesgNum.FILE_ID, mesg, { fieldDescriptions, });
        }).toThrowError("Could not construct MesgDefinition from Message");
    });
});

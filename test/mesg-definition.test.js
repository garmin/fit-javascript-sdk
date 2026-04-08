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

    test("Equals returns true for same definition", () => {
        const mesg = { type: 4, manufacturer: 1, };
        const def1 = new MesgDefinition(Profile.MesgNum.FILE_ID, mesg);
        const def2 = new MesgDefinition(Profile.MesgNum.FILE_ID, mesg);

        expect(def1.equals(def2)).toBe(true);
    });

    test("Equals returns false for different fields", () => {
        const def1 = new MesgDefinition(Profile.MesgNum.FILE_ID, { type: 4, manufacturer: 1, });
        const def2 = new MesgDefinition(Profile.MesgNum.FILE_ID, { type: 4, });

        expect(def1.equals(def2)).toBe(false);
    });

    test("Equals returns false for different message types", () => {
        const def1 = new MesgDefinition(Profile.MesgNum.FILE_ID, { type: 4, });
        const def2 = new MesgDefinition(Profile.MesgNum.FILE_CREATOR, { softwareVersion: 100, });

        expect(def1.equals(def2)).toBe(false);
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

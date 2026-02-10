/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import CrcCalculator from "../src/crc-calculator.js"
import Data from "./data/test-data.js"

describe("CRC Tests", () => {
    test("Header CRC should be correct", () => {
        const buf = new Uint8Array(Data.fitFileShort);
        expect(CrcCalculator.calculateCRC(buf, 0, 12)).toBe(0xA38E);
    });

    test("File CRC should be correct", () => {
        const buf = new Uint8Array(Data.fitFileShort);
        expect(CrcCalculator.calculateCRC(buf, 0, buf.length - 2)).toBe(0xF25D);
    });

    test("File CRC should not be correct", () => {
        const buf = new Uint8Array([0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00]);
        expect(CrcCalculator.calculateCRC(buf, 0, 14)).not.toBe(0x0000);
    });
});
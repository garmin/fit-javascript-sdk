/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import * as fs from "fs";

import Decoder from "../src/decoder.js";
import HrMesgUtils from "../src/utils-hr-mesg.js";
import Stream from "../src/stream.js";

import HrData from "./data/test-data-expand-hr-mesgs.js";

describe("HrMesg Utils Tests", () => {

    test("Expand Heart Rates Test", () => {
        const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
        const stream = Stream.fromBuffer(buf);
        const decode = new Decoder(stream);
        const { messages, errors } = decode.read();
        expect(errors.length).toBe(0);

        const heartrates = HrMesgUtils.expandHeartRates(messages.hrMesgs);

        expect(heartrates.length).toBe(HrData.expandedHrMessages.length);

        heartrates.forEach((mesg, index) => {
            const expected = HrData.expandedHrMessages[index];
            expect(mesg.timestamp).toBe(expected.timestamp);
            expect(mesg.heartRate).toBe(expected.heartRate);
        });
    });

    test("Merge HR Mesgs to Record Mesgs Test", () => {
        const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
        const stream = Stream.fromBuffer(buf);
        const decode = new Decoder(stream);
        const { messages, errors } = decode.read({ mergeHeartRates: true, convertDateTimesToDates: false });
        expect(errors.length).toBe(0);

        expect(messages.recordMesgs.length).toBe(HrData.mergedRecordMessages.length);

        messages.recordMesgs.forEach((mesg, index) => {
            const expected = HrData.mergedRecordMessages[index];
            expect(mesg.timestamp).toBe(expected.timestamp);
            expect(mesg.heartRate).toBe(expected.heartRate);
        });
    });
});
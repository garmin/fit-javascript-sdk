/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2025 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import Data from "../test/data/test-data.js";
import Decoder from "../src/decoder.js";
import MemoGlobUtils from "../src/utils-memo-glob.js";
import Profile from "../src/profile.js";
import Stream from "../src/stream.js";
import UtilsInternal from "../src/utils-internal.js";

const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
const japaneseMultibyteString = "\"第１条 すべての人間は、生まれながらにして自由であり、かつ、尊厳と権利とについて平等である。人間は、理性と良心とを授けられており、互いに同胞の精神をもって行動しなければならない。第２条 すべて人は、人種、皮膚の色、性、言語、宗教、政治上その他の意見、国民的もしくは社会的出身、財産、門地その他の地位又はこれに類するいかなる自由による差別をも受けることなく、この宣言に掲げるすべての権利と自由とを享有することができる。\""

describe("Memo Glob Decoder Integration Tests", () => {
    test.each([
        { name: "Simple string to existing message decodes properly", data: Data.fitFileMemoGlobSimple, expected: "string", targetMesg: "workoutStepMesgs", targetField: "notes", },
        { name: "Long string to existing message decodes properly", data: Data.fitFileMemoGlobLoremIpsum, expected: loremIpsum, targetMesg: "workoutStepMesgs", targetField: "notes", },
        { name: "Long Japanese multibyte string to existing message decodes properly", data: Data.fitFileMemoGlobMultibyte, expected: japaneseMultibyteString, targetMesg: "workoutStepMesgs", targetField: "notes", },
        { name: "Simple string to unknown target field in existing mesg decodes properly and creates new field", data: Data.fitFileMemoGlobUnknownTargetField, expected: "string", targetMesg: "workoutStepMesgs", targetField: 250, },
        { name: "Simple string to unknown message does not decode as the message is excluded as unknown data", data: Data.fitFileMemoGlobUnknownTargetMesg, expected: undefined, targetMesg: "1000", targetField: 250, },
    ])(
        "Decoder default options - Test %# - $name", ({ data, expected, targetMesg, targetField, }) => {
            const stream = Stream.fromByteArray(data);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ decodeMemoGlobs: true, });
            expect(errors.length).toBe(0);

            const decodedMemoGlobString = messages[targetMesg]?.[0]?.[targetField];

            let cleanedString = UtilsInternal.trimStringTrailingNulls(decodedMemoGlobString);

            expect(cleanedString).toBe(expected);
        }
    );

    test.each([
        { name: "Simple string to existing message decodes properly", data: Data.fitFileMemoGlobSimple, expected: "string", targetMesg: "workoutStepMesgs", targetField: "notes", },
        { name: "Long string to existing message decodes properly", data: Data.fitFileMemoGlobLoremIpsum, expected: loremIpsum, targetMesg: "workoutStepMesgs", targetField: "notes", },
        { name: "Long Japanese multibyte string to existing message decodes properly", data: Data.fitFileMemoGlobMultibyte, expected: japaneseMultibyteString, targetMesg: "workoutStepMesgs", targetField: "notes", },
        { name: "Simple string to unknown target field in existing mesg decodes properly and creates new field", data: Data.fitFileMemoGlobUnknownTargetField, expected: "string", targetMesg: "workoutStepMesgs", targetField: 250, },
        { name: "Simple string to unknown message decodes as the message is included as unknown data", data: Data.fitFileMemoGlobUnknownTargetMesg, expected: "string", targetMesg: "1000", targetField: 250, },
    ])(
        "Decoder include unknown data - Test %# - $name", ({ data, expected, targetMesg, targetField, }) => {
            const stream = Stream.fromByteArray(data);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ includeUnknownData: true, decodeMemoGlobs: true });
            expect(errors.length).toBe(0);

            const decodedMemoGlobString = messages[targetMesg]?.[0]?.[targetField];

            let cleanedString = UtilsInternal.trimStringTrailingNulls(decodedMemoGlobString);

            expect(cleanedString).toBe(expected);
        }
    );
});

describe("MemoGlob Utils Tests", () => {
    test("decodeMemoGlobs when message is workoutStep adds decoded string to workoutStep", () => {
        const messages = {
            memoGlobMesgs: [{ mesgNum: "workoutStep", parentIndex: 0, fieldNum: 8, partIndex: 0, data: [104, 101, 108, 108, 111, 33] }],
            workoutStepMesgs: [{ messageIndex: 0, notes: "to be overwritten" }]
        }

        MemoGlobUtils.decodeMemoGlobs(messages);

        expect(messages.workoutStepMesgs[0].notes).toBe("hello!");
    });

    test("decodeMemoGlobs when target field does not exist should create new field", () => {
        const utf8Encode = new TextEncoder();

        const messages = {
            memoGlobMesgs: [{ mesgNum: "workoutStep", parentIndex: 0, fieldNum: 1, partIndex: 0, data: Array.from(utf8Encode.encode("hello!")) }],
            workoutStepMesgs: [{ messageIndex: 0, notes: "Not the target field" }]
        }

        MemoGlobUtils.decodeMemoGlobs(messages);

        expect(messages.workoutStepMesgs[0].notes).toBe("Not the target field");
        expect(messages.workoutStepMesgs[0].durationType).toBe("hello!");

    });

    test("decodeMemoGlobs when message is not found does not throw error", () => {
        const messages = {
            memoGlobMesgs: [{ mesgNum: Profile.MesgNum.RECORD, parentIndex: 0, fieldNum: 2, partIndex: 0, }],
        }

        MemoGlobUtils.decodeMemoGlobs(messages);
    });

    test("decodeMemoGlobs when message is unknown adds decoded string to unknown message and field", () => {
        const messages = {
            memoGlobMesgs: [{ mesgNum: 1000, parentIndex: 0, fieldNum: 2, partIndex: 0, data: [104, 101, 108, 108, 111, 33] }],
            1000: [{ 2: "to be overwritten" }]
        }

        MemoGlobUtils.decodeMemoGlobs(messages);

        expect(messages[1000][0][2]).toBe("hello!");
    });

    test("decodeMemoGlobs when message is unknown adds decoded string to unknown message and field", () => {
        const messages = {
            memoGlobMesgs: [{ mesgNum: 1000, parentIndex: 0, fieldNum: 2, partIndex: 0, data: [104, 101, 108, 108, 111, 33] }],
            1000: [{ 2: "to be overwritten" }]
        }

        MemoGlobUtils.decodeMemoGlobs(messages);

        expect(messages[1000][0][2]).toBe("hello!");
    });

});
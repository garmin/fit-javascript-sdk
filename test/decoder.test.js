/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import * as fs from "fs";
import { jest } from "@jest/globals";

import CRC from "../src/crc-calculator.js";
import Decoder from "../src/decoder.js";
import Stream from "../src/stream.js";
import Data from "./data/test-data.js";
import HrData from "./data/test-data-expand-hr-mesgs.js";

describe("Decoder Tests", () => {
    describe("Decoder Constructor Tests", () => {
        test("Constructor should throw when no Stream is provided.", () => {
            expect(() => { new Decoder() }).toThrowError("FIT Runtime Error");
        });
    });

    describe("Decoder Is FIT Tests", () => {
        describe("isFIT()", () => {
            test("Is a FIT File", () => {
                const stream = Stream.fromByteArray(Data.fitFileShort);
                expect(Decoder.isFIT(stream)).toBe(true);
            });

            test("When stream length is zero isFIT() returns false", () => {
                const stream = Stream.fromByteArray([]);
                expect(Decoder.isFIT(stream)).toBe(false);
            });

            test("Input Length < 14", () => {
                const stream = Stream.fromByteArray([0xE]);
                expect(Decoder.isFIT(stream)).toBe(false);
            });

            test("Header Size != 14 || 12", () => {
                const stream = Stream.fromByteArray([0xFF, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00]);
                expect(Decoder.isFIT(stream)).toBe(false);
            });

            test("Data Type != .FIT", () => {
                const stream = Stream.fromByteArray([0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x91, 0x33, 0x00, 0x00]);
                expect(Decoder.isFIT(stream)).toBe(false);
            });
        });
    });

    describe("Decoder Check Integrity Tests", () => {

        describe("checkIntegrity()", () => {
            test("When file is valid Check Integrity returns true", () => {
                const stream = Stream.fromByteArray(Data.fitFileChained);
                const decode = new Decoder(stream);
                expect(decode.checkIntegrity()).toBe(true);
            });

            test("When file is not a FIT checkIntegrity() returns false", () => {
                const isFITMock = jest
                    .spyOn(Decoder.prototype, "isFIT")
                    .mockImplementationOnce(() => {
                        return false;
                    });

                const stream = Stream.fromByteArray(Data.fitFileChained);
                const decode = new Decoder(stream);
                expect(decode.checkIntegrity()).toBe(false);
            });

            test("When stream length less than expected checkIntegrity() returns false", () => {
                const stream = Stream.fromByteArray([0x0E, 0x10, 0xD9, 0x07, 0xFF, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00]);
                const decode = new Decoder(stream);
                expect(decode.checkIntegrity()).toBe(false);
            });

            test("When Header CRC is incorrect checkIntegrity() returns false", () => {
                const calculateCRCMock = jest
                    .spyOn(CRC, "calculateCRC")
                    .mockImplementationOnce(() => {
                        return false;
                    });

                const stream = Stream.fromByteArray(Data.fitFileChained);
                const decode = new Decoder(stream);
                expect(decode.checkIntegrity()).toBe(false);
            });

            test("When File CRC is incorrect checkIntegrity() returns false", () => {
                const stream = Stream.fromByteArray([0x0E, 0x20, 0x8B, 0x08, 0x0B, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0xCC, 0xFB, 0x40, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x04, 0xFF, 0xFF,]);
                const decode = new Decoder(stream);
                expect(decode.checkIntegrity()).toBe(false);
            });
        });
    });

    describe("Decoder FIT File Tests", () => {
        test("When file is not a FIT read() returns an error", () => {
            const isFITMock = jest
                .spyOn(Decoder.prototype, "isFIT")
                .mockImplementationOnce(() => {
                    return false;
                });

            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBeGreaterThanOrEqual(1);

        });
        test("There should be 1 file_id messsage", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            expect(decode.checkIntegrity()).toBe(true);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
        });
    });
    describe("Chained FIT File Tests", () => {
        test("There should be 2 file_id messsages", () => {
            const stream = Stream.fromByteArray(Data.fitFileChained);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(2);
        });

        test("There should be 1 file_id messsage", () => {
            const stream = Stream.fromByteArray(Data.fitFileChainedWeirdVivoki);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
        });
    });

    describe("Convert Date Options Tests", () => {
        test("Date Time should be Date by default", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages["fileIdMesgs"][0].timeCreated.toString()).toBe(new Date(1000000000000 + 631065600000).toString());
        });

        test("Date Time should be Date when convertDateTimesToDates: true", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ convertDateTimesToDates: true });
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages["fileIdMesgs"][0].timeCreated.toString()).toBe(new Date(1000000000000 + 631065600000).toString());
        });

        test("Date Time should be integer when convertDateTimesToDates: false", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ convertDateTimesToDates: false });
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages["fileIdMesgs"][0].timeCreated).toBe(1000000000);
        });
    });

    describe("Convert Type Options Tests", () => {
        test("Types should be converted by default", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages["fileIdMesgs"][0].type).toBe("activity");
        });

        test("Types should be converted when convertTypesToStrings: true", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ convertTypesToStrings: true });
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages["fileIdMesgs"][0].type).toBe("activity");
        });

        test("Types should be integers when convertTypesToStrings: false", () => {
            const stream = Stream.fromByteArray(Data.fitFileShort);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ convertTypesToStrings: false });
            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages["fileIdMesgs"][0].type).toBe(4);
        });
    });

    describe("Apply Scale and Offset Options Tests", () => {
        test("Apply Scale and Offset should be applied by default", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages["recordMesgs"][0].altitude).toBe(127);
        });

        test("Apply Scale and Offset should be applied when applyScaleAndOffset :true", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ applyScaleAndOffset: true });
            expect(errors.length).toBe(0);
            expect(messages["recordMesgs"][0].altitude).toBe(127);
        });

        test("Apply Scale and Offset should not be applied when applyScaleAndOffset: false", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ applyScaleAndOffset: false, mergeHeartRates: false });
            expect(errors.length).toBe(0);
            expect(messages["recordMesgs"][0].altitude).toBe(3135);
        });

        test("Scale and Offset should be applied to arrays", () => {
            const buf = fs.readFileSync("test/data/WithGearChangeData.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            const leftPowerPhase = messages.recordMesgs[28].leftPowerPhase;
            const leftPowerPhasePeak = messages.recordMesgs[28].leftPowerPhasePeak;

            const rightPowerPhase = messages.recordMesgs[28].rightPowerPhase;
            const rightPowerPhasePeak = messages.recordMesgs[28].rightPowerPhasePeak;

            expect(leftPowerPhase).toEqual([337.5000052734376, 199.68750312011724]);
            expect(leftPowerPhasePeak).toEqual([75.93750118652346, 104.0625016259766]);

            expect(rightPowerPhase).toEqual([7.031250109863283, 205.31250320800785]);
            expect(rightPowerPhasePeak).toEqual([70.31250109863284, 106.8750016699219]);
        });
    });

    describe("Compressed Timestamp Data Message Tests", () => {
        test("Compressed Timestamp Data Message should error", () => {
            const stream = Stream.fromByteArray(Data.fitFileShortCompressedTimestamp);
            const decode = new Decoder(stream);
            const { errors } = decode.read();
            expect(errors.length).toBe(1);
            expect(errors[0].message).toContain("compressed timestamp messages are not currently supported");
        });
    });

    describe("Decoder FIT Files With Developer Data Tests", () => {
        test("When Developer Data exists, it should be read", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages.recordMesgs.length).toBe(3601);

            expect(messages.fieldDescriptionMesgs[0].fieldName).toBe("Doughnuts Earned");
            expect(messages.developerDataIdMesgs[0].applicationId.join('')).toBe("3210547689101112131415");
            expect(messages.sessionMesgs[0].developerFields[0]).toBeCloseTo(3, 0);

            messages.recordMesgs.forEach((recordMesg) => {
                expect(recordMesg.heartRate).toBe(recordMesg.developerFields[1]);
            });
        });

        test("When Developer Data exists but there is no field description message, the decoder should not break", () => {
            const stream = Stream.fromByteArray(Data.fitFileDevDataWithoutFieldDescription);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);
            expect(messages.activityMesgs.length).toBe(1);
        });
    });

    describe("Component Expansion Tests", () => {
        test("Component Expansion should be used by default", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            messages["recordMesgs"].forEach((recordMesg) => {
                expect(recordMesg.enhancedAltitude).toBe(recordMesg.altitude);
                expect(recordMesg.enhancedSpeed).toBe(recordMesg.speed);
            });
            // TODO - Check "enhanced" values in Session and Lap messages (need to use a different file.)
        });

        test("Component Expansion should be used when expandComponents:true", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ expandComponents: true });
            expect(errors.length).toBe(0);

            messages["recordMesgs"].forEach((recordMesg) => {
                expect(recordMesg.enhancedAltitude).toBe(recordMesg.altitude);
                expect(recordMesg.enhancedSpeed).toBe(recordMesg.speed);
            });
            // TODO - Check "enhanced" values in Session and Lap messages (need to use a different file.)
        });

        test("Component Expansion should not be used when expandComponents:false", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ expandComponents: false, mergeHeartRates: false });
            expect(errors.length).toBe(0);

            messages["recordMesgs"].forEach((recordMesg) => {
                expect(recordMesg.enhancedAltitude).not.toBeDefined();
                expect(recordMesg.enhancedSpeed).not.toBeDefined();
            });
            // TODO - Check "enhanced" values in Session and Lap messages (need to use a different file.)
        });

        test("HR message event_timestamp12 field should expand into event_timestamp as array", () => {
            const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            let i = 0;
            messages.hrMesgs.forEach(hrMesg => {
                const eventTimestamps = Array.isArray(hrMesg.eventTimestamp) ? hrMesg.eventTimestamp : [hrMesg.eventTimestamp];
                eventTimestamps.forEach(eventTimestamp => {
                    expect(eventTimestamp).toBeCloseTo(HrData.componentExpansionOfHrMessages[i++], 10);
                });
            })
        });

        test("Component Expansion should work with expanded components which are enums", () => {
            const stream = Stream.fromByteArray(Data.fitFileMonitoring);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();

            expect(errors.length).toBe(0);
            expect(messages.monitoringMesgs.length).toBe(4);

            expect(messages.monitoringMesgs[0].activityType).toBe(8);
            expect(messages.monitoringMesgs[0].intensity).toBe(3);

            expect(messages.monitoringMesgs[1].activityType).toBe(0);
            expect(messages.monitoringMesgs[1].intensity).toBe(0);

            expect(messages.monitoringMesgs[2].activityType).toBe(30);
            expect(messages.monitoringMesgs[2].intensity).toBe(6);

            expect(messages.monitoringMesgs[3].activityType).toBe(undefined);
            expect(messages.monitoringMesgs[3].intensity).toBe(undefined);
        });

    });

    describe("Sub-Field Expansion Tests", () => {
        test("Sub Fields should be expanded by default", () => {
            const buf = fs.readFileSync("test/data/WithGearChangeData.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            const gearChangeEventMesgs = messages.eventMesgs.filter((eventMesg) => eventMesg.hasOwnProperty('gearChangeData'));
            expect(gearChangeEventMesgs.length).toBe(Data.gearChangeData.length);

        });

        test("Sub Fields should be expanded when expandSubFields: true", () => {
            const buf = fs.readFileSync("test/data/WithGearChangeData.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ expandSubFields: true });
            expect(errors.length).toBe(0);

            const gearChangeEventMesgs = messages.eventMesgs.filter((eventMesg) => eventMesg.hasOwnProperty('gearChangeData'));
            expect(gearChangeEventMesgs.length).toBe(Data.gearChangeData.length);
        });

        test("Sub Fields should not be expanded when expandSubFields: false", () => {
            const buf = fs.readFileSync("test/data/WithGearChangeData.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ expandSubFields: false });
            expect(errors.length).toBe(0);

            const gearChangeEventMesgs = messages.eventMesgs.filter((eventMesg) => eventMesg.hasOwnProperty('gearChangeData'));
            expect(gearChangeEventMesgs.length).toBe(0);
        });

        test("Sub Fields should have types converted to strings", () => {
            const buf = fs.readFileSync("test/data/WithGearChangeData.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            const riderPositionEventMesgs = messages.eventMesgs.filter((eventMesg) => eventMesg.hasOwnProperty('riderPosition'));

            const someAreIntegers = riderPositionEventMesgs.some(mesg => Number.isInteger(mesg.riderPosition));

            expect(someAreIntegers).toBeFalsy();

        });

        const workout800mRepeats = [
            { data: Data.workout800mRepeatsLittleEndian },
            { data: Data.workout800mRepeatsBigEndian }];

        test.each(workout800mRepeats)("Sub Fields should have scale and offset applied", ({ data: workout800mRepeat }) => {
            const stream = Stream.fromByteArray(workout800mRepeat);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            const durationDistanceWktSteps = messages.workoutStepMesgs.filter((workoutStepMesg) => workoutStepMesg.hasOwnProperty('durationDistance'));

            const distances = [4000, 800, 200, 1000];

            durationDistanceWktSteps.forEach((workoutStepMesg, index) => {
                expect(workoutStepMesg.durationDistance).toBe(distances[index]);
            });
        });
    });

    describe("Sub Field and Component Expansion Tests", () => {
        test("Sub Field Plus Component Expansion should create gear change data fields", () => {
            const buf = fs.readFileSync("test/data/WithGearChangeData.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            const gearChangeEventMesgs = messages.eventMesgs.filter((eventMesg) => eventMesg.hasOwnProperty('gearChangeData'));

            expect(gearChangeEventMesgs.length).toBe(Data.gearChangeData.length);

            gearChangeEventMesgs.forEach((mesg, index) => {
                const expected = Data.gearChangeData[index];
                expect(mesg.frontGearNum).toBe(expected.frontGearNum);
                expect(mesg.frontGear).toBe(expected.frontGear);
                expect(mesg.rearGearNum).toBe(expected.rearGearNum);
                expect(mesg.rearGear).toBe(expected.rearGear);
                expect(mesg.data).toBe(expected.data);
                expect(mesg.gearChangeData).toBe(expected.gearChangeData);
            });
        });
    });

    describe("Mesg Listener Tests", () => {
        test("Mesg Listener Should Be Called", () => {
            const buf = fs.readFileSync("test/data/Activity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);

            const { errors } = decode.read({
                mesgListener: (mesgNum, mesg) => {
                    throw Error("Message Listener was Called!!!")
                }
            });

            expect(errors.length).toBe(1);
            expect(errors[0].message).toBe("Message Listener was Called!!!");
        });
    });

    describe("Merge Heart Rates Tests", () => {
        test("Merge Heart Rates should be applied by default test", () => {
            const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();
            expect(errors.length).toBe(0);

            expect(messages.recordMesgs.every(recordMesg => recordMesg.hasOwnProperty("heartRate"))).toBe(true);
        });

        test("Merge Heart Rates should be applied when mergeHeartRates: true", () => {
            const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ mergeHeartRates: true });
            expect(errors.length).toBe(0);

            expect(messages.recordMesgs.every(recordMesg => recordMesg.hasOwnProperty("heartRate"))).toBe(true);
        });

        test("Merge Heart Rates should not be applied when mergeHeartRates: false", () => {
            const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ mergeHeartRates: false });
            expect(errors.length).toBe(0);

            expect(messages.recordMesgs.every(recordMesg => recordMesg.hasOwnProperty("heartRate"))).toBe(false);
        });

        test("When applyScaleAndOffset: false && mergeHeartRates: true there should be an error", () => {
            const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ applyScaleAndOffset: false });
            expect(errors.length).toBe(1);
        });

        test("When expandComponents: false && mergeHeartRates: true there should be an error", () => {
            const buf = fs.readFileSync("test/data/HrmPluginTestActivity.fit");
            const stream = Stream.fromBuffer(buf);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read({ expandComponents: false });
            expect(errors.length).toBe(1);
        });
    });

    describe("Corrupt File Tests", () => {
        test("When the field definition size and data type do not match, read past the field", () => {
            const stream = Stream.fromByteArray(Data.fitFileShortWithWrongFieldDefSize);
            const decode = new Decoder(stream);
            const { messages, errors } = decode.read();

            expect(errors.length).toBe(0);
            expect(messages["fileIdMesgs"].length).toBe(1);
            expect(messages.fileIdMesgs[0].hasOwnProperty("timeCreated")).toBe(false);

        });
    });
});

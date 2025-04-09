/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2025 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { expect, test } from "vitest";

import * as fs from "fs";

import { Encoder, Profile, Utils } from "../src/index.js";

test("Can encode a FIT Activity file", () => {
    const twoPI = Math.PI * 2.0;
    const semicirclesPerMeter = 107.173;
    const DOUGHNUTS_EARNED_KEY = 0;
    const HEART_RATE_KEY = 1;

    const mesgs = [];

    // Create the Developer Id message for the developer data fields.
    const developerDataIdMesg = {
        mesgNum: Profile.MesgNum.DEVELOPER_DATA_ID,
        applicationId: Array(16).fill(0), // In practice, this should be a UUID converted to a byte array
        applicationVersion: 1,
        developerDataIndex: 0,
    };
    mesgs.push(developerDataIdMesg);

    // Create the developer data Field Descriptions
    const doughnutsFieldDescMesg = {
        mesgNum: Profile.MesgNum.FIELD_DESCRIPTION,
        developerDataIndex: 0,
        fieldDefinitionNumber: 0,
        fitBaseTypeId: Utils.FitBaseType.FLOAT32,
        fieldName: "Doughnuts Earned",
        units: "doughnuts",
        nativeMesgNum: Profile.MesgNum.SESSION,
    };
    mesgs.push(doughnutsFieldDescMesg);

    const hrFieldDescMesg = {
        mesgNum: Profile.MesgNum.FIELD_DESCRIPTION,
        developerDataIndex: 0,
        fieldDefinitionNumber: 1,
        fitBaseTypeId: Utils.FitBaseType.UINT8,
        fieldName: "Heart Rate",
        units: "bpm",
        nativeMesgNum: Profile.MesgNum.RECORD,
        nativeFieldNum: 3, // See the FIT Profile for the native field numbers

    };
    mesgs.push(hrFieldDescMesg);

    // Link the Developer Data Id and Field Description messages with a unique key
    const fieldDescriptions = {
        [DOUGHNUTS_EARNED_KEY]: {
            developerDataIdMesg: developerDataIdMesg,
            fieldDescriptionMesg: doughnutsFieldDescMesg,
        },
        [HEART_RATE_KEY]: {
            developerDataIdMesg: developerDataIdMesg,
            fieldDescriptionMesg: hrFieldDescMesg,
        },
    };

    // The starting timestamp for the activity
    const now = new Date();
    const localTimestampOffset = now.getTimezoneOffset() * -60;
    const startTime = Utils.convertDateToDateTime(now);

    // Every FIT file MUST contain a File ID message
    mesgs.push({
        mesgNum: Profile.MesgNum.FILE_ID,
        type: "activity",
        manufacturer: "development",
        product: 0,
        timeCreated: startTime,
        serialNumber: 1234,
    });

    // A Device Info message is a BEST PRACTICE for FIT ACTIVITY files
    mesgs.push({
        mesgNum: Profile.MesgNum.DEVICE_INFO,
        deviceIndex: "creator",
        manufacturer: "development",
        product: 0,
        productName: "FIT Cookbook",
        serialNumber: 1234,
        softwareVersion: 12.34,
        timestamp: startTime,
    });

    // Timer Events are a BEST PRACTICE for FIT ACTIVITY files
    mesgs.push({
        mesgNum: Profile.MesgNum.EVENT,
        timestamp: startTime,
        event: "timer",
        eventType: "start",
    });

    // Every FIT ACTIVITY file MUST contain Record messages
    let timestamp = startTime;

    for (let i = 0; i <= 3600; i++) {
        mesgs.push({
            mesgNum: Profile.MesgNum.RECORD,
            timestamp: timestamp,
            distance: i, // Ramp
            enhancedSpeed: 1, // Flat Line
            heartRate: (Math.sin(twoPI * (0.01 * i + 10)) + 1.0) * 127.0, // Sine
            cadence: i % 255, // Sawtooth
            power: (i % 255) < 127 ? 150 : 250, // Square
            enhancedAltitude: Math.abs((i % 255) - 127), // Triangle
            positionLat: 0, // Flat Line
            positionLong: i * semicirclesPerMeter, // Ramp

            // Add a Developer Field to the Record Message
            developerFields: {
                [HEART_RATE_KEY]: (Math.cos(twoPI * (0.01 * i + 10)) + 1.0) * 127.0, // Cosine
            },
        });

        timestamp++;
    }

    // Timer Events are a BEST PRACTICE for FIT ACTIVITY files
    mesgs.push({
        mesgNum: Profile.MesgNum.EVENT,
        timestamp: timestamp,
        event: "timer",
        eventType: "stop",
    });

    // Every FIT ACTIVITY file MUST contain at least one Lap message
    mesgs.push({
        mesgNum: Profile.MesgNum.LAP,
        messageIndex: 0,
        timestamp: timestamp,
        startTime: startTime,
        totalElapsedTime: timestamp - startTime,
        totalTimerTime: timestamp - startTime,
    });

    // Every FIT ACTIVITY file MUST contain at least one Session message
    mesgs.push({
        mesgNum: Profile.MesgNum.SESSION,
        messageIndex: 0,
        timestamp: timestamp,
        startTime: startTime,
        totalElapsedTime: timestamp - startTime,
        totalTimerTime: timestamp - startTime,
        sport: "standUpPaddleboarding",
        subSport: "generic",
        firstLapIndex: 0,
        numLaps: 1,

        // Add a Developer Field to the Session Message
        developerFields: {
            [DOUGHNUTS_EARNED_KEY]: (timestamp - startTime) / 1200.0, // Three per hour
        },
    });

    // Every FIT ACTIVITY file MUST contain EXACTLY one Activity message
    mesgs.push({
        mesgNum: Profile.MesgNum.ACTIVITY,
        timestamp: timestamp,
        numSessions: 1,
        localTimestamp: timestamp + localTimestampOffset,
        totalTimerTime: timestamp = startTime,
    });

    try {
        // Create an Encoder and provide the developer data field descriptions
        const encoder = new Encoder({ fieldDescriptions, });

        // Write each message to the encoder
        mesgs.forEach((mesg) => {
            encoder.writeMesg(mesg);
        });

        // Close the encoder
        const uint8Array = encoder.close();

        // Write the bytes to a file
        fs.writeFileSync("test/data/encode-activity-recipe.fit", uint8Array);

        expect(uint8Array.length).toBe(108485);
    }
    catch (error) {
        console.error(error.name, error.message, JSON.stringify(error?.cause, null, 2));

        throw error;
    }
});

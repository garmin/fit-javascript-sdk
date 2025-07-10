
import { expect, test } from "vitest";
import { Encoder, Decoder, Stream, Profile, Utils } from "../src/index.js";

test("should encode and decode altitude correctly", () => {
    const originalRecord = {
        latitude: -37.85724407642275,
        longitude: 145.12993351469538,
        altitude: 116.4,
        timestamp: 1751980229357,
        distance: 10.2,
        speed: 2,
        grade: 2.3,
        calories: 32,
        heartRate: 72
    };

    const semicircles = {
        latitude: originalRecord.latitude * (Math.pow(2, 31) / 180),
        longitude: originalRecord.longitude * (Math.pow(2, 31) / 180),
    };

    const mesgs = [];
    const now = new Date();
    const startTime = Utils.convertDateToDateTime(now);

    mesgs.push({
        mesgNum: Profile.MesgNum.FILE_ID,
        type: "activity",
        manufacturer: "development",
        product: 0,
        timeCreated: startTime,
        serialNumber: 1234,
    });
    
    mesgs.push({
        mesgNum: Profile.MesgNum.DEVICE_INFO,
        deviceIndex: "creator",
        manufacturer: "development",
        product: 0,
        productName: "Cookbook",
        serialNumber: 1234,
        softwareVersion: 1.0,
        timestamp: startTime,
    });

    const recordMesg = {
        mesgNum: Profile.MesgNum.RECORD,
        timestamp: Utils.convertDateToDateTime(new Date(originalRecord.timestamp)),
        positionLat: semicircles.latitude,
        positionLong: semicircles.longitude,
        altitude: originalRecord.altitude,
        distance: originalRecord.distance,
        speed: originalRecord.speed,
        grade: originalRecord.grade,
        calories: originalRecord.calories,
        heartRate: originalRecord.heartRate,
        enhancedAltitude: originalRecord.altitude,
        enhancedSpeed: originalRecord.speed,
    };
    mesgs.push(recordMesg);

    mesgs.push({
        mesgNum: Profile.MesgNum.LAP,
        messageIndex: 0,
        timestamp: startTime + 1,
        startTime: startTime,
        totalElapsedTime: 1,
        totalTimerTime: 1,
    });

    mesgs.push({
        mesgNum: Profile.MesgNum.SESSION,
        messageIndex: 0,
        timestamp: startTime + 1,
        startTime: startTime,
        totalElapsedTime: 1,
        totalTimerTime: 1,
        sport: "walking",
        subSport: "generic",
        firstLapIndex: 0,
        numLaps: 1,
    });

    mesgs.push({
        mesgNum: Profile.MesgNum.ACTIVITY,
        timestamp: startTime + 1,
        numSessions: 1,
        totalTimerTime: 1,
    });
    
    const encoder = new Encoder();
    mesgs.forEach((mesg) => {
        encoder.writeMesg(mesg);
    });
    const fitFile = encoder.close();

    const stream = Stream.fromBuffer(fitFile);
    const decoder = new Decoder(stream);
    const { messages, errors } = decoder.read();

    expect(errors.length).toBe(0);

    const decodedRecord = messages.recordMesgs[0];

    expect(decodedRecord).toBeDefined();
    expect(decodedRecord.altitude).toBeCloseTo(originalRecord.altitude, 1);
    expect(decodedRecord.speed).toBeCloseTo(originalRecord.speed, 1);
    expect(decodedRecord.grade).toBeCloseTo(originalRecord.grade, 1);
    expect(decodedRecord.calories).toBeCloseTo(originalRecord.calories, 1);
    expect(decodedRecord.heartRate).toBeCloseTo(originalRecord.heartRate, 1);
    expect(decodedRecord.enhancedAltitude).toBeCloseTo(originalRecord.altitude, 1);
    expect(decodedRecord.enhancedSpeed).toBeCloseTo(originalRecord.speed, 1);
});
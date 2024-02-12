/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2024 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import Utils from "../src/utils.js";

describe("Utils Tests", () => {
    test("0 should be Sun, 31 Dec 1989 00:00:00 GMT", () => {
        const date = Utils.convertDateTimeToDate(0);
        expect(date.toString()).toBe(new Date(Date.UTC(1989, 11, 31, 0, 0, 0)).toString());
    });

    test("1000000000 should be Wed, 08 Sep 2021 01:46:40 GMT", () => {
        const date = Utils.convertDateTimeToDate(1000000000);
        expect(date.toString()).toBe(new Date(Date.UTC(2021, 8, 8, 1, 46, 40)).toString());
    });

    test("No convertDateTimeToDate arguements should be Sun, 31 Dec 1989 00:00:00 GMT", () => {
        const date = Utils.convertDateTimeToDate();
        expect(date.toString()).toBe(new Date(Date.UTC(1989, 11, 31, 0, 0, 0)).toString());
    });

    test("Null should be Sun, 31 Dec 1989 00:00:00 GMT", () => {
        const date = Utils.convertDateTimeToDate(null);
        expect(date.toString()).toBe(new Date(Date.UTC(1989, 11, 31, 0, 0, 0)).toString());
    });
});
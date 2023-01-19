/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import Accumulator from "../src/accumulator.js";

describe("Accumulator Tests", () => {
    test("Happy Path", () => {
        const accumulator = new Accumulator();

        accumulator.add(0, 0, 0);
        expect(accumulator.accumulate(0, 0, 1, 8)).toBe(1);

        accumulator.add(0, 0, 0);
        expect(accumulator.accumulate(0, 0, 2, 8)).toBe(2);

        accumulator.add(0, 0, 0);
        expect(accumulator.accumulate(0, 0, 3, 8)).toBe(3);

        accumulator.add(0, 0, 0);
        expect(accumulator.accumulate(0, 0, 4, 8)).toBe(4);
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////

import { describe, expect, test } from "vitest";

import Accumulator from "../src/accumulator.js";

describe("Accumulator Tests", () => {
    test("Accumulates field", () => {
        const accumulator = new Accumulator();

        accumulator.createAccumulatedField(0, 0, 0);

        expect(accumulator.accumulate(0, 0, 1, 8)).toBe(1);
        expect(accumulator.accumulate(0, 0, 2, 8)).toBe(2);
        expect(accumulator.accumulate(0, 0, 3, 8)).toBe(3);
        expect(accumulator.accumulate(0, 0, 4, 8)).toBe(4);
    });

    test("Accumulates multiple fields independently", () => {
        const accumulator = new Accumulator();

        accumulator.createAccumulatedField(0, 0, 0);
        expect(accumulator.accumulate(0, 0, 254, 8)).toBe(254);

        accumulator.createAccumulatedField(1, 1, 0);
        expect(accumulator.accumulate(1, 1, 2, 8)).toBe(2);

        expect(accumulator.accumulate(0, 0, 0, 8)).toBe(256);
    });

    test("Accumulates when field rolls over", () => {
        const accumulator = new Accumulator();

        accumulator.createAccumulatedField(0, 0, 250);

        expect(accumulator.accumulate(0, 0, 254, 8)).toBe(254);
        expect(accumulator.accumulate(0, 0, 255, 8)).toBe(255);
        expect(accumulator.accumulate(0, 0, 0, 8)).toBe(256);
        expect(accumulator.accumulate(0, 0, 3, 8)).toBe(259);
    });
});

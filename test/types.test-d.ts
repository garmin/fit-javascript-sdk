/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import { expectTypeOf, test, expect, describe } from "vitest";

import * as FIT from "../src/index";

describe("Decoder Type Tests", () => {
    test("Decoder Constructor", () => {
        expectTypeOf(FIT.Decoder).constructorParameters.toEqualTypeOf<[stream: FIT.Stream]>();

        // @ts-expect-error
        expectTypeOf(FIT.Decoder).constructorParameters.toEqualTypeOf<undefined>();
    });

    test("Decoder isFIT instance", () => {
        const decoder = new FIT.Decoder(FIT.Stream.fromByteArray(new Uint8Array([0x00, 0x00, 0x00, 0x00])));

        const isFitInstance = decoder.isFIT();
        expectTypeOf(isFitInstance).toEqualTypeOf<boolean>();
        expect(isFitInstance).toBe(false);
    });

    test("Decoder isFIT static", () => {
        expectTypeOf(FIT.Decoder.isFIT).parameters.toEqualTypeOf<[stream: FIT.Stream]>();

        const isFitStatic = FIT.Decoder.isFIT(FIT.Stream.fromByteArray(new Uint8Array([0x00, 0x00, 0x00, 0x00])));
        expectTypeOf(isFitStatic).toEqualTypeOf<boolean>();
        expect(isFitStatic).toBe(false);
    });

    test("Decoder checkIntegrity", () => {
        const decoder = new FIT.Decoder(FIT.Stream.fromByteArray(new Uint8Array([0x00, 0x00, 0x00, 0x00])));
        expectTypeOf(decoder.checkIntegrity).returns.toEqualTypeOf<boolean>();
    });

    test("Decoder read", () => {
        const decoder = new FIT.Decoder(FIT.Stream.fromByteArray(new Uint8Array([0x00, 0x00, 0x00, 0x00])));
        const result = decoder.read();

        expectTypeOf(result).toEqualTypeOf<{ messages: FIT.FitMessages; profileVersion: FIT.ProfileVersion; errors: Error[] }>();
        expectTypeOf(result.profileVersion).toEqualTypeOf<FIT.ProfileVersion>();

        const version: FIT.ProfileVersion = { major: 1, minor: 0 };
        expectTypeOf(version.major).toEqualTypeOf<number>();
        expectTypeOf(version.minor).toEqualTypeOf<number>();
    });

    test("DecoderOptions", () => {
        const options: FIT.DecoderOptions = {
            mesgListener: (mesgNum, mesg) => {
                expectTypeOf(mesgNum).toEqualTypeOf<number>();
                expectTypeOf(mesg).toEqualTypeOf<FIT.Mesg>();
            },
            mesgDefinitionListener: (mesgDefinition) => {
                expectTypeOf(mesgDefinition).toEqualTypeOf<FIT.MesgDefinition>();
            },
            fieldDescriptionListener: (key, developerDataIdMesg, fieldDescriptionMesg) => {
                expectTypeOf(key).toEqualTypeOf<number>();
                expectTypeOf(developerDataIdMesg).toEqualTypeOf<FIT.DeveloperDataIdMesg>();
                expectTypeOf(fieldDescriptionMesg).toEqualTypeOf<FIT.FieldDescriptionMesg>();
            },
            expandSubFields: true,
            expandComponents: true,
            applyScaleAndOffset: true,
            convertTypesToStrings: true,
            convertDateTimesToDates: true,
            includeUnknownData: false,
            mergeHeartRates: false,
            decodeMemoGlobs: false,
            skipHeader: false,
            dataOnly: false,
        };
        expectTypeOf(options).toEqualTypeOf<FIT.DecoderOptions>();
    });

    test("MesgDefinition and FieldDefinition", () => {
        const fieldDef: FIT.FieldDefinition = {
            fieldDefinitionNumber: 0,
            size: 1,
            baseType: 0,
            invalidValue: 0xff,
            baseTypeSize: 1,
        };
        expectTypeOf(fieldDef.fieldDefinitionNumber).toEqualTypeOf<number>();
        expectTypeOf(fieldDef.size).toEqualTypeOf<number>();
        expectTypeOf(fieldDef.baseType).toEqualTypeOf<number>();
        expectTypeOf(fieldDef.invalidValue).toEqualTypeOf<number>();
        expectTypeOf(fieldDef.baseTypeSize).toEqualTypeOf<number>();

        const devFieldDef: FIT.DeveloperFieldDefinition = {
            fieldDefinitionNumber: 0,
            size: 1,
            developerDataIndex: 0,
        };
        expectTypeOf(devFieldDef.developerDataIndex).toEqualTypeOf<number>();
    });
});

describe("Stream Type Tests", () => {
    test("Stream constructor", () => {
        expectTypeOf(FIT.Stream).constructorParameters.toEqualTypeOf<[buffer: ArrayBuffer]>();
    });

    test("Stream static factory methods", () => {
        expectTypeOf(FIT.Stream.fromByteArray).parameters.toEqualTypeOf<[data: number[] | Uint8Array]>();
        expectTypeOf(FIT.Stream.fromByteArray).returns.toEqualTypeOf<FIT.Stream>();

        expectTypeOf(FIT.Stream.fromBuffer).parameters.toEqualTypeOf<[buffer: Uint8Array]>();
        expectTypeOf(FIT.Stream.fromBuffer).returns.toEqualTypeOf<FIT.Stream>();

        expectTypeOf(FIT.Stream.fromArrayBuffer).parameters.toEqualTypeOf<[buffer: ArrayBuffer]>();
        expectTypeOf(FIT.Stream.fromArrayBuffer).returns.toEqualTypeOf<FIT.Stream>();
    });

    test("Stream instance properties", () => {
        const stream = FIT.Stream.fromByteArray(new Uint8Array([0x00]));

        expectTypeOf(stream.length).toEqualTypeOf<number>();
        expectTypeOf(stream.bytesRead).toEqualTypeOf<number>();
        expectTypeOf(stream.position).toEqualTypeOf<number>();
        expectTypeOf(stream.crcCalculator).toEqualTypeOf<FIT.CrcCalculator>();
    });

    test("Stream navigation methods", () => {
        const stream = FIT.Stream.fromByteArray(new Uint8Array([0x00]));

        expectTypeOf(stream.reset).returns.toEqualTypeOf<void>();
        expectTypeOf(stream.seek).parameters.toEqualTypeOf<[position: number]>();
        expectTypeOf(stream.seek).returns.toEqualTypeOf<void>();
        expectTypeOf(stream.slice).parameters.toEqualTypeOf<[begin: number, end: number]>();
        expectTypeOf(stream.slice).returns.toEqualTypeOf<ArrayBuffer>();
        expectTypeOf(stream.peekByte).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readByte).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readBytes).parameters.toEqualTypeOf<[size: number]>();
        expectTypeOf(stream.readBytes).returns.toEqualTypeOf<Uint8Array>();
    });

    test("Stream readValue", () => {
        const stream = FIT.Stream.fromByteArray(new Uint8Array([0x00]));

        expectTypeOf(stream.readValue).parameters.toEqualTypeOf<[baseType: number, size: number, opts?: FIT.ReadValueOptions]>();
        expectTypeOf(stream.readValue).returns.toEqualTypeOf<FIT.FieldValue>();
    });

    test("ReadValueOptions", () => {
        const opts: FIT.ReadValueOptions = {
            littleEndian: true,
            convertInvalidToNull: true,
        };
        expectTypeOf(opts.littleEndian).toEqualTypeOf<boolean | undefined>();
        expectTypeOf(opts.convertInvalidToNull).toEqualTypeOf<boolean | undefined>();
    });

    test("Stream typed read methods", () => {
        const stream = FIT.Stream.fromByteArray(new Uint8Array([0x00]));

        expectTypeOf(stream.readUInt8).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readInt8).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readUInt16).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readInt16).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readUInt32).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readInt32).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readUInt64).returns.toEqualTypeOf<bigint>();
        expectTypeOf(stream.readInt64).returns.toEqualTypeOf<bigint>();
        expectTypeOf(stream.readFloat32).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readFloat64).returns.toEqualTypeOf<number>();
        expectTypeOf(stream.readString).parameters.toEqualTypeOf<[strlen: number]>();
        expectTypeOf(stream.readString).returns.toEqualTypeOf<string>();
    });
});

describe("Encoder Type Tests", () => {
    test("Encoder constructor", () => {
        expectTypeOf(FIT.Encoder).constructorParameters.toEqualTypeOf<[options?: FIT.EncoderOptions]>();
    });

    test("Encoder close", () => {
        const encoder = new FIT.Encoder();
        expectTypeOf(encoder.close).returns.toEqualTypeOf<Uint8Array>();
    });

    test("Encoder writeMesg", () => {
        const encoder = new FIT.Encoder();
        expectTypeOf(encoder.writeMesg).parameters.toEqualTypeOf<[mesg: FIT.Encodable<FIT.Mesg>]>();
        expectTypeOf(encoder.writeMesg).returns.toEqualTypeOf<FIT.Encoder>();
    });

    test("Encoder onMesg", () => {
        const encoder = new FIT.Encoder();
        expectTypeOf(encoder.onMesg).parameters.toEqualTypeOf<[mesgNum: number, mesg: FIT.Mesg]>();
        expectTypeOf(encoder.onMesg).returns.toEqualTypeOf<FIT.Encoder>();
    });

    test("Encoder addDeveloperField", () => {
        const encoder = new FIT.Encoder();
        expectTypeOf(encoder.addDeveloperField).parameters.toEqualTypeOf<[key: number, developerDataIdMesg: FIT.DeveloperDataIdMesg, fieldDescriptionMesg: FIT.FieldDescriptionMesg]>();
        expectTypeOf(encoder.addDeveloperField).returns.toEqualTypeOf<FIT.Encoder>();
    });

    test("EncoderOptions and FieldDescription", () => {
        const fieldDescription: FIT.FieldDescription = {
            developerDataIdMesg: { developerDataIndex: 0 },
            fieldDescriptionMesg: { developerDataIndex: 0, fieldDefinitionNumber: 0 },
        };
        expectTypeOf(fieldDescription.developerDataIdMesg).toEqualTypeOf<FIT.DeveloperDataIdMesg>();
        expectTypeOf(fieldDescription.fieldDescriptionMesg).toEqualTypeOf<FIT.FieldDescriptionMesg>();

        const options: FIT.EncoderOptions = {
            fieldDescriptions: { 0: fieldDescription },
        };
        expectTypeOf(options.fieldDescriptions).toEqualTypeOf<Record<number, FIT.FieldDescription> | undefined>();
    });
});

describe("Mesg Type Tests", () => {
    test("FileIdMesg fields", () => {
        const fileIdMesg: FIT.FileIdMesg = {
            type: "activity",
            manufacturer: "garmin",
            garminProduct: 123,
            productName: "Test Product",
            timeCreated: new Date(),
            developerFields: {
                customField1: "Custom Value",
                customField2: 42,
            },
        };
        expectTypeOf(fileIdMesg).toExtend<FIT.Mesg>;
        expectTypeOf(fileIdMesg).toEqualTypeOf<FIT.FileIdMesg>;

        expectTypeOf(fileIdMesg.type).toEqualTypeOf<FIT.Types.File | undefined>();
        expectTypeOf(fileIdMesg.manufacturer).toEqualTypeOf<FIT.Types.Manufacturer | undefined>();
        expectTypeOf(fileIdMesg.garminProduct).toEqualTypeOf<FIT.Types.GarminProduct | undefined>();
        expectTypeOf(fileIdMesg.productName).toEqualTypeOf<string | undefined>();
        expectTypeOf(fileIdMesg.timeCreated).toEqualTypeOf<FIT.Types.DateTime | undefined>();
        expectTypeOf(fileIdMesg.developerFields).toEqualTypeOf<FIT.DeveloperFields | undefined>();
    });

    test("Mesg base interface", () => {
        const mesg: FIT.Mesg = {};
        expectTypeOf(mesg.developerFields).toEqualTypeOf<FIT.DeveloperFields | undefined>();
    });

    test("DeveloperFields type", () => {
        const devFields: FIT.DeveloperFields = {
            myField: 123,
            myOtherField: "value",
        };
        expectTypeOf(devFields).toEqualTypeOf<FIT.DeveloperFields>();
    });
});

describe("CrcCalculator Type Tests", () => {
    test("CrcCalculator constructor and properties", () => {
        const crc = new FIT.CrcCalculator();
        expectTypeOf(crc.crc).toEqualTypeOf<number>();
    });

    test("CrcCalculator instance method", () => {
        const crc = new FIT.CrcCalculator();
        expectTypeOf(crc.addBytes).parameters.toEqualTypeOf<[buf: Uint8Array, start: number, end: number]>();
        expectTypeOf(crc.addBytes).returns.toEqualTypeOf<number>();
    });

    test("CrcCalculator static method", () => {
        expectTypeOf(FIT.CrcCalculator.calculateCRC).parameters.toEqualTypeOf<[buf: Uint8Array, start: number, end: number]>();
        expectTypeOf(FIT.CrcCalculator.calculateCRC).returns.toEqualTypeOf<number>();
    });
});

describe("Profile Type Tests", () => {
    test("Profile version", () => {
        expectTypeOf(FIT.Profile.version.major).toEqualTypeOf<number>();
        expectTypeOf(FIT.Profile.version.minor).toEqualTypeOf<number>();
        expectTypeOf(FIT.Profile.version.patch).toEqualTypeOf<number>();
        expectTypeOf(FIT.Profile.version.type).toEqualTypeOf<string>();
    });

    test("Profile MesgNum", () => {
        expectTypeOf(FIT.Profile.MesgNum).toEqualTypeOf<Record<string, number>>();
        expectTypeOf(FIT.Profile.MesgNum.FILE_ID).toEqualTypeOf<number>();
    });

    test("Profile messages", () => {
        expectTypeOf(FIT.Profile.messages).toEqualTypeOf<Record<number, FIT.ProfileMesg>>();
    });

    test("ProfileMesg and ProfileField", () => {
        const mesg: FIT.ProfileMesg = FIT.Profile.messages[FIT.Profile.MesgNum.FILE_ID];
        expectTypeOf(mesg.num).toEqualTypeOf<number>();
        expectTypeOf(mesg.name).toEqualTypeOf<string>();
        expectTypeOf(mesg.messagesKey).toEqualTypeOf<string>();
        expectTypeOf(mesg.fields).toEqualTypeOf<Record<number, FIT.ProfileField>>();
    });
});

describe("Utils Type Tests", () => {
    test("Utils constants", () => {
        expectTypeOf(FIT.Utils.FIT_EPOCH_MS).toEqualTypeOf<number>();
        expectTypeOf(FIT.Utils.FitBaseType).toEqualTypeOf<{
            readonly ENUM: number;
            readonly SINT8: number;
            readonly UINT8: number;
            readonly SINT16: number;
            readonly UINT16: number;
            readonly SINT32: number;
            readonly UINT32: number;
            readonly STRING: number;
            readonly FLOAT32: number;
            readonly FLOAT64: number;
            readonly UINT8Z: number;
            readonly UINT16Z: number;
            readonly UINT32Z: number;
            readonly BYTE: number;
            readonly SINT64: number;
            readonly UINT64: number;
            readonly UINT64Z: number;
        }>();
    });

    test("Utils date conversion methods", () => {
        expectTypeOf(FIT.Utils.convertDateTimeToDate).parameters.toEqualTypeOf<[datetime: number]>();
        expectTypeOf(FIT.Utils.convertDateTimeToDate).returns.toEqualTypeOf<Date>();
        expectTypeOf(FIT.Utils.convertDateToDateTime).parameters.toEqualTypeOf<[date: Date]>();
        expectTypeOf(FIT.Utils.convertDateToDateTime).returns.toEqualTypeOf<number>();
    });

    test("Utils base type lookup maps", () => {
        expectTypeOf(FIT.Utils.BaseTypeToFieldType).toEqualTypeOf<Record<number, string>>();
        expectTypeOf(FIT.Utils.FieldTypeToBaseType).toEqualTypeOf<Record<string, number>>();
    });
});

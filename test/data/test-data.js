/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


const fitFileShort = [
    0x0E, 0x20, 0x8B, 0x08, 0x24, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x8E, 0xA3, // File Header
    0x40, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x01, 0x02, 0x84, 0x04, 0x04, 0x86, 0x08, 0x0A, 0x07, // Message Definition
    0x00, 0x04, 0x01, 0x00, 0x00, 0xCA, 0x9A, 0x3B, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x00, // Message
    0x5D, 0xF2]; // CRC

const fitFileShortWithWrongFieldDefSize = [
    0x0E, 0x20, 0x8B, 0x08, 0x21, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x8E, 0xA3, // File Header
    0x40, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x01, 0x02, 0x84, 0x04, 0x01, 0x86, 0x08, 0x0A, 0x07, // Message Definition
    0x00, 0x04, 0x01, 0x00, 0x12, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x00, // Message
    0x65, 0xFE]; // CRC

const fitFileShortCompressedTimestamp = [0x0E, 0x20, 0x8B, 0x08, 0x24, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x8E, 0xA3, // File Header
    0x40, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x01, 0x02, 0x84, 0x04, 0x04, 0x86, 0x08, 0x0A, 0x07, // Message Definition
    0x80, 0x04, 0x01, 0x00, 0x00, 0xCA, 0x9A, 0x3B, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x00, // Message
    0x5D, 0xF2]; // CRC    

const fitFileChained = [
    0x0E, 0x20, 0x9F, 0x03, 0x64, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54,
    0xB9, 0xE3, 0x40, 0x00, 0x00, 0x00, 0x00, 0x08, 0x03, 0x04, 0x8C, 0x04,
    0x04, 0x86, 0x08, 0x14, 0x07, 0x01, 0x02, 0x84, 0x02, 0x02, 0x84, 0x05,
    0x02, 0x84, 0x06, 0x02, 0x84, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x02, 0x40, 0x00,
    0x00, 0xD3, 0x00, 0x05, 0xFD, 0x04, 0x86, 0x03, 0x02, 0x84, 0x04, 0x02,
    0x84, 0x00, 0x01, 0x02, 0x01, 0x01, 0x02, 0x00, 0x00, 0xCA, 0x9A, 0x3B,
    0x32, 0x00, 0x37, 0x00, 0x2C, 0x2E, 0x7C, 0xD5,
    0x0E, 0x20, 0x9F, 0x03, 0x64, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54,
    0xB9, 0xE3, 0x40, 0x00, 0x00, 0x00, 0x00, 0x08, 0x03, 0x04, 0x8C, 0x04,
    0x04, 0x86, 0x08, 0x14, 0x07, 0x01, 0x02, 0x84, 0x02, 0x02, 0x84, 0x05,
    0x02, 0x84, 0x06, 0x02, 0x84, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x02, 0x40, 0x00,
    0x00, 0xD3, 0x00, 0x05, 0xFD, 0x04, 0x86, 0x03, 0x02, 0x84, 0x04, 0x02,
    0x84, 0x00, 0x01, 0x02, 0x01, 0x01, 0x02, 0x00, 0x00, 0xCA, 0x9A, 0x3B,
    0x32, 0x00, 0x37, 0x00, 0x2C, 0x2E, 0x7C, 0xD5
];

const fitFileChainedWeirdVivoki = [
    // First file with data-size === 0x0000000 and file-CRC === 0x0000
    0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00,
    // Followed by a second legit FIT File
    0x0E, 0x20, 0x9F, 0x03, 0x64, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0xB9, 0xE3,
    0x40, 0x00, 0x00, 0x00, 0x00, 0x08, 0x03, 0x04, 0x8C, 0x04,
    0x04, 0x86, 0x08, 0x14, 0x07, 0x01, 0x02, 0x84, 0x02, 0x02, 0x84, 0x05,
    0x02, 0x84, 0x06, 0x02, 0x84, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xFF, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x02, 0x40, 0x00,
    0x00, 0xD3, 0x00, 0x05, 0xFD, 0x04, 0x86, 0x03, 0x02, 0x84, 0x04, 0x02,
    0x84, 0x00, 0x01, 0x02, 0x01, 0x01, 0x02, 0x00, 0x00, 0xCA, 0x9A, 0x3B,
    0x32, 0x00, 0x37, 0x00, 0x2C, 0x2E, 0x7C, 0xD5
];

const fitFileDevDataWithoutFieldDescription = [
    0x0E, 0x20, 0x64, 0x00, 0xD1, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54,
    0x12, 0x7E, 0x40, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x00, 0x01,
    0x02, 0x84, 0x02, 0x02, 0x84, 0x04, 0x04, 0x86, 0x03, 0x04, 0x8C, 0x00,
    0x04, 0x00, 0xFF, 0x00, 0x00, 0x3D, 0x5D, 0x38, 0xBD, 0x1E, 0x29, 0x25,
    0x9B, 0x60, 0x00, 0x01, 0x00, 0x14, 0x09, 0xFD, 0x04, 0x86, 0x05, 0x04,
    0x86, 0x06, 0x02, 0x84, 0x03, 0x01, 0x02, 0x04, 0x01, 0x02, 0x07, 0x02,
    0x84, 0x02, 0x02, 0x84, 0x00, 0x04, 0x85, 0x01, 0x04, 0x85, 0x01, 0x01,
    0x01, 0x00, 0x00, 0x3D, 0x5D, 0x38, 0xBD, 0x00, 0x00, 0x00, 0x00, 0x03,
    0xE8, 0x7E, 0x00, 0x00, 0x96, 0x07, 0x49, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x7E, 0x00, 0x3D, 0x5D, 0x38, 0xBE, 0x00, 0x00, 0x00,
    0x64, 0x03, 0xE8, 0x86, 0x01, 0x00, 0x96, 0x07, 0x4E, 0x7F, 0xFF, 0xFF,
    0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0x86, 0x00, 0x3D, 0x5D, 0x38, 0xBF, 0x00,
    0x00, 0x00, 0xC8, 0x03, 0xE8, 0x8E, 0x02, 0x00, 0x96, 0x07, 0x53, 0x7F,
    0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0x8E, 0x00, 0x3D, 0x5D, 0x38,
    0xC0, 0x00, 0x00, 0x01, 0x2C, 0x03, 0xE8, 0x96, 0x03, 0x00, 0x96, 0x07,
    0x58, 0x7F, 0xFF, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0xFF, 0x96, 0x40, 0x00,
    0x01, 0x00, 0x22, 0x04, 0xFD, 0x04, 0x86, 0x01, 0x02, 0x84, 0x05, 0x04,
    0x86, 0x00, 0x04, 0x86, 0x00, 0x3D, 0x5D, 0x46, 0xCD, 0x00, 0x01, 0x3D,
    0x5C, 0xF2, 0x6D, 0x00, 0x36, 0xEE, 0x80, 0x78, 0x3B
];

const fitFileMonitoring = [
    0x0E, 0x10, 0x28, 0x23, 0x37, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54,
    0x2C, 0xC6, 0x41, 0x00, 0x01, 0x00, 0x37, 0x03, 0xFD, 0x04, 0x86, 0x18,
    0x01, 0x0D, 0x03, 0x04, 0x86, 0x01, 0x3F, 0x2A, 0xE2, 0xFF, 0x61, 0x00,
    0x00, 0x00, 0x14, 0x01, 0x3F, 0x2A, 0xE2, 0xFF, 0x06, 0x00, 0x00, 0x00,
    0x3C, 0x01, 0x3F, 0x2A, 0xE2, 0xFF, 0x1E, 0x00, 0x00, 0x00, 0x1E, 0x01,
    0x3F, 0x2A, 0xE2, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x1E, 0xED, 0xF9
];

const gearChangeData = [
    {
        "timestamp": 1024873717,
        "rearGearNum": 5,
        "rearGear": 24,
        "frontGearNum": 255,
        "frontGear": 22,
        "data": 385816581,
        "gearChangeData": 385816581
    },
    {
        "timestamp": 1024873760,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024873819,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024873850,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024874601,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024874624,
        "rearGearNum": 8,
        "rearGear": 17,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716040,
        "gearChangeData": 16716040
    },
    {
        "timestamp": 1024874694,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024874698,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024874727,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024874755,
        "rearGearNum": 8,
        "rearGear": 17,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716040,
        "gearChangeData": 16716040
    },
    {
        "timestamp": 1024874824,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024874829,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024874864,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024874913,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024874927,
        "rearGearNum": 4,
        "rearGear": 27,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16718596,
        "gearChangeData": 16718596
    },
    {
        "timestamp": 1024875097,
        "rearGearNum": 5,
        "rearGear": 24,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717829,
        "gearChangeData": 16717829
    },
    {
        "timestamp": 1024875097,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024875111,
        "rearGearNum": 5,
        "rearGear": 24,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717829,
        "gearChangeData": 16717829
    },
    {
        "timestamp": 1024875126,
        "rearGearNum": 4,
        "rearGear": 27,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16718596,
        "gearChangeData": 16718596
    },
    {
        "timestamp": 1024875251,
        "rearGearNum": 3,
        "rearGear": 31,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16719619,
        "gearChangeData": 16719619
    },
    {
        "timestamp": 1024875265,
        "rearGearNum": 4,
        "rearGear": 27,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16718596,
        "gearChangeData": 16718596
    },
    {
        "timestamp": 1024875271,
        "rearGearNum": 5,
        "rearGear": 24,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717829,
        "gearChangeData": 16717829
    },
    {
        "timestamp": 1024875291,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024875364,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024875388,
        "rearGearNum": 8,
        "rearGear": 17,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716040,
        "gearChangeData": 16716040
    },
    {
        "timestamp": 1024875423,
        "rearGearNum": 9,
        "rearGear": 15,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16715529,
        "gearChangeData": 16715529
    },
    {
        "timestamp": 1024875515,
        "rearGearNum": 8,
        "rearGear": 17,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716040,
        "gearChangeData": 16716040
    },
    {
        "timestamp": 1024875589,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024875615,
        "rearGearNum": 8,
        "rearGear": 17,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716040,
        "gearChangeData": 16716040
    },
    {
        "timestamp": 1024875616,
        "rearGearNum": 9,
        "rearGear": 15,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16715529,
        "gearChangeData": 16715529
    },
    {
        "timestamp": 1024875621,
        "rearGearNum": 10,
        "rearGear": 13,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16715018,
        "gearChangeData": 16715018
    },
    {
        "timestamp": 1024875622,
        "rearGearNum": 11,
        "rearGear": 11,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16714507,
        "gearChangeData": 16714507
    },
    {
        "timestamp": 1024875651,
        "rearGearNum": 9,
        "rearGear": 15,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16715529,
        "gearChangeData": 16715529
    },
    {
        "timestamp": 1024875658,
        "rearGearNum": 8,
        "rearGear": 17,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716040,
        "gearChangeData": 16716040
    },
    {
        "timestamp": 1024875658,
        "rearGearNum": 7,
        "rearGear": 19,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16716551,
        "gearChangeData": 16716551
    },
    {
        "timestamp": 1024875665,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": null,
        "data": 16717062,
        "gearChangeData": 16717062
    },
    {
        "timestamp": 1024875695,
        "rearGearNum": 6,
        "rearGear": 21,
        "frontGearNum": 255,
        "frontGear": 22,
        "data": 385815814,
        "gearChangeData": 385815814
    }
];

const workout800mRepeatsLittleEndian = [
    0x0E, 0x10, 0x8D, 0x08, 0xDB, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54,
    0xDE, 0xB8, 0x40, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x01, 0x00, 0x01,
    0x02, 0x84, 0x02, 0x02, 0x84, 0x04, 0x04, 0x86, 0x03, 0x04, 0x8C, 0x00,
    0x05, 0xFF, 0x00, 0x00, 0x00, 0x12, 0xAD, 0x66, 0x3D, 0x38, 0xB6, 0xC1,
    0x0A, 0x40, 0x00, 0x00, 0x1A, 0x00, 0x04, 0x08, 0x15, 0x07, 0x04, 0x01,
    0x00, 0x0B, 0x01, 0x00, 0x06, 0x02, 0x84, 0x00, 0x52, 0x75, 0x6E, 0x6E,
    0x69, 0x6E, 0x67, 0x20, 0x38, 0x30, 0x30, 0x6D, 0x20, 0x52, 0x65, 0x70,
    0x65, 0x61, 0x74, 0x73, 0x00, 0x01, 0xFF, 0x05, 0x00, 0x40, 0x00, 0x00,
    0x1B, 0x00, 0x08, 0x02, 0x04, 0x86, 0xFE, 0x02, 0x84, 0x07, 0x01, 0x00,
    0x01, 0x01, 0x00, 0x03, 0x01, 0x00, 0x04, 0x04, 0x86, 0x05, 0x04, 0x86,
    0x06, 0x04, 0x86, 0x00, 0x80, 0x1A, 0x06, 0x00, 0x00, 0x00, 0x02, 0x01,
    0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x80, 0x38, 0x01, 0x00, 0x01, 0x00, 0x00, 0x01, 0x01, 0x04,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x20, 0x4E, 0x00, 0x00, 0x02, 0x00, 0x01, 0x01, 0x01, 0x02, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x00, 0x00, 0x03, 0x00, 0xFF, 0x06, 0x02, 0x05, 0x00, 0x00, 0x00, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0xA0, 0x86, 0x01, 0x00,
    0x04, 0x00, 0x03, 0x01, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0xAE, 0xC4
];

const workout800mRepeatsBigEndian = [
    0x0E, 0x20, 0x9F, 0x03, 0xDB, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54,
    0xF2, 0xD7, 0x40, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x00, 0x01,
    0x02, 0x84, 0x02, 0x02, 0x84, 0x04, 0x04, 0x86, 0x03, 0x04, 0x8C, 0x00,
    0x05, 0x00, 0xFF, 0x00, 0x00, 0x3D, 0x66, 0xAD, 0x12, 0x0A, 0xC1, 0xB6,
    0x38, 0x40, 0x00, 0x01, 0x00, 0x1A, 0x04, 0x08, 0x15, 0x07, 0x04, 0x01,
    0x00, 0x0B, 0x01, 0x00, 0x06, 0x02, 0x84, 0x00, 0x52, 0x75, 0x6E, 0x6E,
    0x69, 0x6E, 0x67, 0x20, 0x38, 0x30, 0x30, 0x6D, 0x20, 0x52, 0x65, 0x70,
    0x65, 0x61, 0x74, 0x73, 0x00, 0x01, 0xFF, 0x00, 0x05, 0x40, 0x00, 0x01,
    0x00, 0x1B, 0x08, 0x02, 0x04, 0x86, 0xFE, 0x02, 0x84, 0x07, 0x01, 0x00,
    0x01, 0x01, 0x00, 0x03, 0x01, 0x00, 0x04, 0x04, 0x86, 0x05, 0x04, 0x86,
    0x06, 0x04, 0x86, 0x00, 0x00, 0x06, 0x1A, 0x80, 0x00, 0x00, 0x02, 0x01,
    0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x01, 0x38, 0x80, 0x00, 0x01, 0x00, 0x01, 0x01, 0x00,
    0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x4E, 0x20, 0x00, 0x02, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00,
    0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x03, 0xFF, 0x06, 0x02, 0x00, 0x00, 0x00, 0x05, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x01, 0x86, 0xA0,
    0x00, 0x04, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x87, 0x67
];

export default {
    fitFileShort,
    fitFileShortWithWrongFieldDefSize,
    fitFileShortCompressedTimestamp,
    fitFileChained,
    fitFileChainedWeirdVivoki,
    fitFileDevDataWithoutFieldDescription,
    fitFileMonitoring,
    gearChangeData,
    workout800mRepeatsLittleEndian,
    workout800mRepeatsBigEndian
};
/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2026 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////


import { Encoder, Stream, Decoder, Profile } from "../src/index.js";

export const DEFAULT_CUSTOM_MESG_NUM = 0xFF00;

/**
 * Encodes an array of FIT messages into a byte array.
 * @param {Array} mesgs - Array of message objects containing a mesg and its mesgNum.
 * @param {Object} options - Encoder options.
 * @param {Object} [options.fieldDescriptions] - Field descriptions for encoding developer fields.
 * @returns {Uint8Array} The encoded FIT file as a byte array.
 */
export const encodeMesgs = (mesgs = [], { fieldDescriptions } = {}) => {
    const encoder = new Encoder({ fieldDescriptions });

    mesgs.forEach(({ mesgNum, mesg }) => {
        encoder.onMesg(mesgNum, mesg);
    });

    return encoder.close();
}

/**
 * Decodes a byte array into FIT messages.
 * @param {Uint8Array} byteArray - The byte array to decode.
 * @param {Object} decoderOptions - Decoder configuration options.
 * @returns {Object} The decoded FIT data.
 */
export const decodeByteArray = (byteArray, decoderOptions) => {
    const stream = Stream.fromByteArray(byteArray);
    const decoder = new Decoder(stream);

    return decoder.read(decoderOptions);
}

/**
 * Encodes an array of FIT messages and then decodes them back.
 * @param {Array} mesgs - Array of message objects containing a mesg and its mesgNum.
 * @param {Object} options - Encoding and decoding options.
 * @param {Object} [options.fieldDescriptions] - fieldDescriptions for encoding developer fields.
 * @param {Object} [options.decoderOptions] - Decoder configuration options.
 * @returns {Object} The decoded FIT data.
 */
export const encodeThenDecodeMesgs = (mesgs = [], { fieldDescriptions, decoderOptions } = {}) => {
    const byteArray = encodeMesgs(mesgs, { fieldDescriptions });

    return decodeByteArray(byteArray, decoderOptions);
}

/**
 * Adds a custom field to a message profile for testing custom or unknown fields.
 * @param {number} mesgNum - The mesgNum of the message to add the field to.
 * @param {number} fieldNum - The field number for the new field.
 * @param {Object} options - Field configuration options.
 * @param {string} [options.name="testField"] - The name of the field.
 * @param {string} [options.type="uint8"] - The field type.
 * @param {string} [options.baseType="uint8"] - The base type of the field.
 * @param {boolean} [options.array=false] - Whether the field is an array.
 * @param {number} [options.scale=1] - The scale factor for the field value.
 * @param {number} [options.offset=0] - The offset for the field value.
 * @param {string} [options.units=""] - The units for the field.
 * @param {number} [options.bits=0] - The number of bits used by the field.
 * @param {Array} [options.components=[]] - Array of field components.
 * @param {boolean} [options.hasComponents=false] - Whether the field has components.
 * @param {boolean} [options.isAccumulated=false] - Whether the field is accumulated.
 * @param {Array} [options.subFields=[]] - Array of subfields.
 */
export const addCustomFieldToFitMesgProfile = (mesgNum, fieldNum, {
    name = `testField${fieldNum}`,
    type = "uint8",
    baseType = "uint8",
    array = false,
    scale = 1,
    offset = 0,
    units = "",
    bits = 0,
    components = [],
    hasComponents = false,
    isAccumulated = false,
    subFields = [],
} = {}) => {
    Profile.messages[mesgNum].fields[fieldNum] = {
        num: fieldNum,
        name,
        type,
        baseType,
        array,
        scale,
        offset,
        units,
        bits,
        components,
        hasComponents,
        isAccumulated,
        subFields,
    }
}

/**
 * Adds a custom message to the FIT Profile for testing custom or unknown messages.
 * @param {number} mesgNum - The mesgNum for the message.
 * @param {string} - The name of the message.
 * @param {Object} [fields={}] - Object mapping field numbers to field definitions. Each field definition follows
 * the structure of field definitions in the FIT Profile.
 */
export const addCustomMesgToFitProfile = (mesgNum, name = `testMesg${mesgNum}`, fieldDefs = {}) => {
    Profile.messages[mesgNum] = {
        num: mesgNum,
        name,
        messagesKey: `${name}Mesgs`,
        fields: {},
    }

    Object.entries(fieldDefs).forEach(([fieldNum, fieldDef]) => {
        addCustomFieldToFitMesgProfile(mesgNum, Number(fieldNum), fieldDef);
    });
}
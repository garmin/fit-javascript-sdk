/////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023 Garmin International, Inc.
// Licensed under the Flexible and Interoperable Data Transfer (FIT) Protocol License; you
// may not use this file except in compliance with the Flexible and Interoperable Data
// Transfer (FIT) Protocol License.
/////////////////////////////////////////////////////////////////////////////////////////////
// ****WARNING****  This file is auto-generated!  Do NOT edit this file.
// Profile Version = 21.115Release
// Tag = production/release/21.115.00-0-gfe0a7f8
/////////////////////////////////////////////////////////////////////////////////////////////


import Accumulator from "../src/accumulator.js";
import BitStream from "../src/bit-stream.js";
import CrcCalculator from "./crc-calculator.js";
import FIT from "./fit.js";
import HrMesgUtils from "./utils-hr-mesg.js";
import Profile from "./profile.js";
import Stream from "./stream.js";
import Utils from "./utils.js";
import UtilsInternal from "./utils-internal.js";

const COMPRESSED_HEADER_MASK = 0x80;
const MESG_DEFINITION_MASK = 0x40;
const DEV_DATA_MASK = 0x20;
const MESG_HEADER_MASK = 0x00;
const LOCAL_MESG_NUM_MASK = 0x0F;
const CRC_SIZE = 2;

class Decoder {
    #localMessageDefinitions = [];
    #developerDataDefinitions = {};
    #stream = null;
    #accumulator = new Accumulator();
    #messages = {};
    #fieldsWithSubFields = [];
    #fieldsToExpand = [];

    #mesgListener = null;
    #optExpandSubFields = true;
    #optExpandComponents = true;
    #optApplyScaleAndOffset = true;
    #optConvertTypesToStrings = true;
    #optConvertDateTimesToDates = true;
    #optIncludeUnknownData = false;
    #optMergeHeartRates = true;

    /**
     * Creates a FIT File Decoder
     * @constructor
     * @param {Stream} stream - representing the FIT file to decode
     */
    constructor(stream) {
        if (stream == null) {
            throw Error("FIT Runtime Error stream parameter is null or undefined");
        }

        this.#stream = stream;
    }

    /**
     * Inspects the file header to determine if the input stream is a FIT file
     * @param {Stream} stream
     * @returns {Boolean} True if the stream is a FIT file
     * @static
     */
    static isFIT(stream) {
        try {
            const fileHeaderSize = stream.peekByte();
            if ([14, 12].includes(fileHeaderSize) != true) {
                return false;
            }

            if (stream.length < fileHeaderSize + CRC_SIZE) {
                return false;
            }

            const fileHeader = Decoder.#readFileHeader(stream, true);
            if (fileHeader.dataType !== ".FIT") {
                return false;
            }
        }
        catch (error) {
            return false;
        }

        return true;
    }

    /**
     * Inspects the file header to determine if the input stream is a FIT file
     * @returns {Boolean} True if the stream is a FIT file
     */
    isFIT() {
        return Decoder.isFIT(this.#stream);
    }

    /**
     * Checks that the input stream is a FIT file and verifies both the header and file CRC values
     * @returns {Boolean} True if the stream passes the isFit() and CRC checks
     */
    checkIntegrity() {
        try {
            if (!this.isFIT()) {
                return false;
            }

            const fileHeader = Decoder.#readFileHeader(this.#stream, true);

            if (this.#stream.length < fileHeader.headerSize + fileHeader.dataSize + CRC_SIZE) {
                return false;
            }

            const buf = new Uint8Array(this.#stream.slice(0, this.#stream.length))

            if (fileHeader.headerSize === 14 && fileHeader.headerCRC !== 0x0000
                && fileHeader.headerCRC != CrcCalculator.calculateCRC(buf, 0, 12)) {
                return false;
            }

            const fileCRC = (buf[fileHeader.headerSize + fileHeader.dataSize + 1] << 8) + buf[fileHeader.headerSize + fileHeader.dataSize]
            if (fileCRC != CrcCalculator.calculateCRC(buf, 0, fileHeader.headerSize + fileHeader.dataSize)) {
                return false;
            }
        }
        catch (error) {
            return false;
        }

        return true;
    }

    /**
     * Message Listener Callback
     *
     * @callback Decoder~mesgListener
     * @param {Number} mesgNum - Profile.MesgNum
     * @param {Object} message - The message
     */


    /**
     * Read the messages from the stream.
     * @param {Object=} [options] - Read options (optional)
     * @param {Decoder~mesgListener} [options.mesgListener=null] - (optional, default null) mesgListener(mesgNum, message)
     * @param {Boolean} [options.expandSubFields=true] - (optional, default true)
     * @param {Boolean} [options.expandComponents=true] - (optional, default true)
     * @param {Boolean} [options.applyScaleAndOffset=true] - (optional, default true)
     * @param {Boolean} [options.convertTypesToStrings=true] - (optional, default true)
     * @param {boolean} [options.convertDateTimesToDates=true] - (optional, default true)
     * @param {Boolean} [options.includeUnknownData=false] - (optional, default false)
     * @param {boolean} [options.mergeHeartRates=true] - (optional, default false)
     * @return {Object} result - {messages:Array, errors:Array}
     */
    read({
        mesgListener = null,
        expandSubFields = true,
        expandComponents = true,
        applyScaleAndOffset = true,
        convertTypesToStrings = true,
        convertDateTimesToDates = true,
        includeUnknownData = false,
        mergeHeartRates = true } = {}) {

        this.#mesgListener = mesgListener;
        this.#optExpandSubFields = expandSubFields
        this.#optExpandComponents = expandComponents;
        this.#optApplyScaleAndOffset = applyScaleAndOffset;
        this.#optConvertTypesToStrings = convertTypesToStrings;
        this.#optConvertDateTimesToDates = convertDateTimesToDates;
        this.#optIncludeUnknownData = includeUnknownData;
        this.#optMergeHeartRates = mergeHeartRates;

        this.#localMessageDefinitions = [];
        this.#developerDataDefinitions = {};
        this.#messages = {};

        const errors = [];

        try {
            if (this.#optMergeHeartRates && (!this.#optApplyScaleAndOffset || !this.#optExpandComponents)) {
                this.#throwError("mergeHeartRates requires applyScaleAndOffset and expandComponents to be enabled");
            }

            this.#stream.reset();

            while (this.#stream.position < this.#stream.length) {
                this.#decodeNextFile();
            }

            if (this.#optMergeHeartRates) {
                HrMesgUtils.mergeHeartRates(this.#messages.hrMesgs, this.#messages.recordMesgs);
            }
        }
        catch (error) {
            errors.push(error);
        }
        finally {
            return { messages: this.#messages, errors: errors };
        }
    }

    #decodeNextFile() {
        const position = this.#stream.position;

        if (!this.isFIT()) {
            this.#throwError("input is not a FIT file");
        }

        this.#stream.crcCalculator = new CrcCalculator();

        const fileHeader = Decoder.#readFileHeader(this.#stream);

        // Read data messages and definitions
        while (this.#stream.position < (position + fileHeader.headerSize + fileHeader.dataSize)) {
            this.#decodeNextRecord();
        }

        // Check the CRC
        const calculatedCrc = this.#stream.crcCalculator.crc;
        const crc = this.#stream.readUInt16();
        if (crc !== calculatedCrc) {
            this.#throwError("CRC error");
        }
    }

    #decodeNextRecord() {
        const recordHeader = this.#stream.peekByte();

        if ((recordHeader & COMPRESSED_HEADER_MASK) === COMPRESSED_HEADER_MASK) {
            return this.#decodeCompressedTimestampDataMessage();
        }

        if ((recordHeader & MESG_DEFINITION_MASK) === MESG_HEADER_MASK) {
            return this.#decodeMessage();
        }

        if ((recordHeader & MESG_DEFINITION_MASK) === MESG_DEFINITION_MASK) {
            return this.#decodeMessageDefinition();
        }
    }

    #decodeMessageDefinition() {
        const recordHeader = this.#stream.readByte();

        const messageDefinition = {};
        messageDefinition["recordHeader"] = recordHeader;
        messageDefinition["localMesgNum"] = recordHeader & LOCAL_MESG_NUM_MASK;
        messageDefinition["reserved"] = this.#stream.readByte();

        messageDefinition["architecture"] = this.#stream.readByte();
        messageDefinition["endianness"] = messageDefinition.architecture === 0 ? Stream.LITTLE_ENDIAN : Stream.BIG_ENDIAN;

        messageDefinition["globalMessageNumber"] = this.#stream.readUInt16({ endianness: messageDefinition["endianness"] });
        messageDefinition["numFields"] = this.#stream.readByte();
        messageDefinition["fieldDefinitions"] = [];
        messageDefinition["developerFieldDefinitions"] = [];
        messageDefinition["messageSize"] = 0;
        messageDefinition["developerDataSize"] = 0;

        for (let i = 0; i < messageDefinition.numFields; i++) {
            const fieldDefinition = {
                fieldDefinitionNumber: this.#stream.readByte(),
                size: this.#stream.readByte(),
                baseType: this.#stream.readByte()
            };

            if (!(fieldDefinition.baseType in FIT.BaseTypeDefinitions)) {
                this.#throwError();
            }

            fieldDefinition["invalidValue"] = FIT.BaseTypeDefinitions[fieldDefinition.baseType].invalid;
            fieldDefinition["baseTypeSize"] = FIT.BaseTypeDefinitions[fieldDefinition.baseType].size;

            messageDefinition.fieldDefinitions.push(fieldDefinition);
            messageDefinition.messageSize += fieldDefinition.size;
        }

        if ((recordHeader & DEV_DATA_MASK) === DEV_DATA_MASK) {
            const numDevFields = this.#stream.readByte();

            for (let i = 0; i < numDevFields; i++) {
                const developerFieldDefinition = {
                    fieldDefinitionNumber: this.#stream.readByte(),
                    size: this.#stream.readByte(),
                    developerDataIndex: this.#stream.readByte()
                };

                messageDefinition.developerFieldDefinitions.push(developerFieldDefinition);
                messageDefinition.developerDataSize += developerFieldDefinition.size;
            }
        }

        let messageProfile = Profile.messages[messageDefinition.globalMessageNumber];

        if (messageProfile == null && this.#optIncludeUnknownData) {
            messageProfile = {
                name: messageDefinition["globalMessageNumber"].toString(),
                messagesKey: messageDefinition["globalMessageNumber"].toString(),
                num: messageDefinition["globalMessageNumber"],
                fields: {}
            };
        }

        this.#localMessageDefinitions[messageDefinition.localMesgNum] = { ...messageDefinition, ...messageProfile };

        if (messageProfile && !this.#messages.hasOwnProperty(messageProfile.messagesKey)) {
            this.#messages[messageProfile.messagesKey] = [];
        }
    }

    #decodeMessage() {
        const recordHeader = this.#stream.readByte();

        const localMesgNum = recordHeader & LOCAL_MESG_NUM_MASK;
        const messageDefinition = this.#localMessageDefinitions[localMesgNum];

        if (messageDefinition == null) {
            this.#throwError();
        }

        const fields = messageDefinition.fields ?? {};
        const mesgNum = messageDefinition.num;
        const message = {};
        this.#fieldsWithSubFields = [];
        this.#fieldsToExpand = [];

        messageDefinition.fieldDefinitions.forEach(fieldDefinition => {
            const field = fields[fieldDefinition.fieldDefinitionNumber];
            const { fieldName, rawFieldValue } = this.#readFieldValue(messageDefinition, fieldDefinition, field);

            if (fieldName != null && (field != null || this.#optIncludeUnknownData)) {
                message[fieldName] = { rawFieldValue, fieldDefinitionNumber: fieldDefinition.fieldDefinitionNumber };

                if (field.subFields.length > 0) {
                    this.#fieldsWithSubFields.push(fieldName);
                }

                if (field.hasComponents) {
                    this.#fieldsToExpand.push(fieldName);
                }

                if (field.isAccumulated) {
                    this.#accumulator.add(mesgNum, fieldDefinition.fieldDefinitionNumber, rawFieldValue);
                }
            }
        });

        const developerFields = {};

        messageDefinition.developerFieldDefinitions.forEach(developerFieldDefinition => {
            const field = this.#lookupDeveloperDataField(developerFieldDefinition)
            if (field == null) {
                // If there is not a field definition, then read past the field data.
                this.#stream.readBytes(developerFieldDefinition.size);
                return;
            }

            developerFieldDefinition["baseType"] = field.fitBaseTypeId;
            developerFieldDefinition["invalidValue"] = FIT.BaseTypeDefinitions[developerFieldDefinition.baseType].invalid;
            developerFieldDefinition["baseTypeSize"] = FIT.BaseTypeDefinitions[developerFieldDefinition.baseType].size;

            const { rawFieldValue: fieldValue } = this.#readFieldValue(messageDefinition, developerFieldDefinition, field);

            if (fieldValue != null) {
                developerFields[field.key] = fieldValue;
            }
        });

        if (mesgNum === Profile.MesgNum.DEVELOPER_DATA_ID) {
            this.#addDeveloperDataIdToProfile(message);
        }
        else if (mesgNum === Profile.MesgNum.FIELD_DESCRIPTION) {
            const key = Object.keys(this.#developerDataDefinitions)
                .reduce((count, key) => count + this.#developerDataDefinitions[key].fields.length, 0);
            message["key"] = { fieldValue: key, rawFieldValue: key };

            this.#addFieldDescriptionToProfile(message);
        }
        else {
            this.#expandSubFields(mesgNum, message);
            this.#expandComponents(mesgNum, message, fields);
        }

        this.#transformValues(message, messageDefinition);

        if (messageDefinition.name != null) {
            Object.keys(message).forEach((key) => {
                message[key] = message[key].fieldValue;
            });

            if (Object.keys(developerFields).length > 0) {
                message.developerFields = developerFields;
            }

            this.#messages[messageDefinition.messagesKey].push(message);
            this.#mesgListener?.(messageDefinition.globalMessageNumber, message);
        }
    }

    #decodeCompressedTimestampDataMessage() {
        this.#throwError("compressed timestamp messages are not currently supported");
    }

    #readFieldValue(messageDefinition, fieldDefinition, field) {
        const rawFieldValue = this.#readRawFieldValue(messageDefinition, fieldDefinition, field);

        if (rawFieldValue == null) {
            return {};
        }

        return {
            fieldName: (field?.name ?? ~~fieldDefinition.fieldDefinitionNumber),
            rawFieldValue
        };
    }

    #readRawFieldValue(messageDefinition, fieldDefinition, field) {
        const rawFieldValue = this.#stream.readValue(
            fieldDefinition.baseType,
            fieldDefinition.size,
            {
                endianness: messageDefinition["endianness"],
                convertInvalidToNull: !field?.hasComponents ?? false
            }
        );
        return rawFieldValue;
    }

    #addDeveloperDataIdToProfile(message) {
        if (message == null || message.developerDataIndex.rawFieldValue == null || message.developerDataIndex.rawFieldValue === 0xFF) {
            return;
        }

        this.#developerDataDefinitions[message.developerDataIndex.rawFieldValue] = {
            developerDataIndex: message.developerDataIndex?.rawFieldValue,
            developerId: message.developerId?.rawFieldValue ?? null,
            applicationId: message.applicationId?.rawFieldValue ?? null,
            manufacturerId: message.manufacturerId?.rawFieldValue ?? null,
            applicationVersion: message.applicationVersion?.rawFieldValue ?? null,
            fields: []
        };
    }

    #addFieldDescriptionToProfile(message) {
        if (message == null || message.developerDataIndex.rawFieldValue == null || message.developerDataIndex.rawFieldValue === 0xFF) {
            return;
        }

        if (this.#developerDataDefinitions[message.developerDataIndex.rawFieldValue] == null) {
            return;
        }

        this.#developerDataDefinitions[message.developerDataIndex.rawFieldValue].fields.push({
            developerDataIndex: message.developerDataIndex?.rawFieldValue,
            fieldDefinitionNumber: message.fieldDefinitionNumber?.rawFieldValue,
            fitBaseTypeId: message.fitBaseTypeId?.rawFieldValue ?? null,
            fieldName: message.fieldName?.rawFieldValue ?? null,
            array: message.array?.rawFieldValue ?? null,
            components: message.components?.rawFieldValue ?? null,
            scale: message.scale?.rawFieldValue ?? null,
            offset: message.offset?.rawFieldValue ?? null,
            units: message.units?.rawFieldValue ?? null,
            bits: message.bits?.rawFieldValue ?? null,
            accumulate: message.accumulate?.rawFieldValue ?? null,
            refFieldName: message.refFieldName?.rawFieldValue ?? null,
            refFieldValue: message.refFieldValue?.rawFieldValue ?? null,
            fitBaseUnitId: message.fitBaseUnitId?.rawFieldValue ?? null,
            nativeMesgNum: message.nativeMesgNum?.rawFieldValue ?? null,
            nativeFieldNum: message.nativeFieldNum?.rawFieldValue ?? null,
            key: message.key.rawFieldValue
        });
    }

    #lookupDeveloperDataField(developerFieldDefinition) {
        try {
            return this.#developerDataDefinitions[developerFieldDefinition.developerDataIndex]
                ?.fields
                ?.find(def => def.fieldDefinitionNumber == developerFieldDefinition.fieldDefinitionNumber)
                ?? null;
        }
        catch {
            return null;
        }
    }

    #expandSubFields(mesgNum, message) {
        if (!this.#optExpandSubFields || this.#fieldsWithSubFields.length == 0) {
            return;
        }

        this.#fieldsWithSubFields.forEach((name) => {
            const field = Profile.messages[mesgNum].fields[message[name].fieldDefinitionNumber];
            this.#expandSubField(message, field);
        });
    }

    #expandSubField(message, field) {
        for (let i = 0; i < field.subFields.length; i++) {
            const subField = field.subFields[i];
            for (let j = 0; j < subField.map.length; j++) {
                const map = subField.map[j];
                const referenceField = message[map.name];
                if (referenceField == null) {
                    continue;
                }
                if (referenceField.rawFieldValue === map.value) {
                    message[subField.name] = JSON.parse(JSON.stringify(message[field.name]));
                    message[subField.name].isSubField = true;

                    if (subField.hasComponents) {
                        this.#fieldsToExpand.push(subField.name);
                    }
                    break;
                }
            }
        }
    }

    #expandComponents(mesgNum, message, fields) {
        // TODO - What do do when the target field is not in the Profile?
        // TODO - This can happen in theory, but can it happen in practice?

        if (!this.#optExpandComponents || this.#fieldsToExpand.length == 0) {
            return;
        }

        const mesg = {};

        while (this.#fieldsToExpand.length > 0) {
            const name = this.#fieldsToExpand.shift();

            const { rawFieldValue, fieldDefinitionNumber, isSubField } = message[name];
            let field = Profile.messages[mesgNum].fields[fieldDefinitionNumber];
            field = isSubField ? this.#lookupSubfield(field, name) : field;
            const baseType = FIT.FieldTypeToBaseType[field.type];

            if (field.hasComponents === false || baseType == null) {
                continue;
            }

            if (UtilsInternal.onlyInvalidValues(rawFieldValue, FIT.BaseTypeDefinitions[baseType].invalid)) {
                continue;
            }

            const bitStream = new BitStream(rawFieldValue, baseType);

            for (let j = 0; j < field.components.length; j++) {
                const targetField = fields[field.components[j]];
                if (mesg[targetField.name] == null) {
                    const baseType = FIT.FieldTypeToBaseType[targetField.type];
                    const invalidValue = baseType != null ? FIT.BaseTypeDefinitions[baseType].invalid : 0xFF;

                    mesg[targetField.name] = {
                        fieldValue: [],
                        rawFieldValue: [],
                        fieldDefinitionNumber: targetField.num,
                        isExpandedField: true,
                        invalidValue,
                    };
                }

                if (bitStream.bitsAvailable < field.bits[j]) {
                    break;
                }

                let value = bitStream.readBits(field.bits[j]);

                value = this.#accumulator.accumulate(mesgNum, targetField.num, value, field.bits[j]) ?? value;

                mesg[targetField.name].rawFieldValue.push(value);

                if (value === mesg[targetField.name].invalidValue) {
                    mesg[targetField.name].fieldValue.push(null);
                }
                else {

                    value = value / field.scale[j] - field.offset[j];
                    mesg[targetField.name].fieldValue.push(value);
                }

                if (targetField.hasComponents) {
                    this.#fieldsToExpand.push(targetField.name);
                }

                if (!bitStream.hasBitsAvailable) {
                    break;
                }
            }
        }

        Object.keys(mesg).forEach((key) => {
            mesg[key].fieldValue = UtilsInternal.sanitizeValues(mesg[key].fieldValue);
            mesg[key].rawFieldValue = UtilsInternal.sanitizeValues(mesg[key].rawFieldValue);

            message[key] = mesg[key];
        });
    }

    #transformValues(message, messageDefinition) {
        const fields = messageDefinition?.fields ?? {};

        for (const name in message) {

            const { rawFieldValue, fieldDefinitionNumber, isExpandedField, isSubField } = message[name];

            let field = fields[fieldDefinitionNumber];
            field = isSubField ? this.#lookupSubfield(field, name) : field;

            if (!isExpandedField) {
                const fieldValue = this.#transformValue(messageDefinition, field, rawFieldValue);
                message[name].fieldValue = fieldValue;
            }
        }
    }

    #transformValue(messageDefinition, field, rawFieldValue) {
        let fieldValue = rawFieldValue;

        if (field == null) {
            fieldValue = rawFieldValue;
        }
        else if (FIT.NumericFieldTypes.includes(field?.type ?? -1)) {
            fieldValue = this.#applyScaleAndOffset(messageDefinition, field, rawFieldValue);
        }
        else if (field.type === "string") {
            fieldValue = rawFieldValue;
        }
        else if (field.type === "dateTime" && this.#optConvertDateTimesToDates) {
            fieldValue = Utils.convertDateTimeToDate(rawFieldValue);
        }
        else if (this.#optConvertTypesToStrings) {
            fieldValue = this.#convertTypeToString(messageDefinition, field, rawFieldValue);
        }
        else {
            fieldValue = rawFieldValue;
        }

        return fieldValue;
    }

    #applyScaleAndOffset(messageDefinition, field, rawFieldValue) {
        if (!this.#optApplyScaleAndOffset) {
            return rawFieldValue;
        }

        if (FIT.NumericFieldTypes.includes(field?.type ?? -1) === false) {
            return rawFieldValue;
        }

        if ([Profile.MesgNum.DEVELOPER_DATA_ID, Profile.MesgNum.FIELD_DESCRIPTION].includes(messageDefinition.globalMessageNumber)) {
            return rawFieldValue;
        }

        if (rawFieldValue == null) {
            return rawFieldValue;
        }

        if (Array.isArray(field?.scale ?? 1) && field.scale.length > 1) {
            return rawFieldValue;
        }

        const scale = Array.isArray(field?.scale ?? 1) ? field?.scale[0] : field?.scale ?? 1;
        const offset = Array.isArray(field?.offset ?? 1) ? field?.offset[0] : field?.offset ?? 0;

        try {
            if (Array.isArray(rawFieldValue)) {
                return rawFieldValue.map((value) => {
                    return value == null ? value : (value / scale) - offset;
                });
            }

            return (rawFieldValue / scale) - offset;
        }
        catch {
            return rawFieldValue;
        }
    }

    #convertTypeToString(messageDefinition, field, rawFieldValue) {
        if ([Profile.MesgNum.DEVELOPER_DATA_ID, Profile.MesgNum.FIELD_DESCRIPTION].includes(messageDefinition.globalMessageNumber)) {
            return rawFieldValue;
        }

        if (FIT.NumericFieldTypes.includes(field?.type ?? -1)) {
            return rawFieldValue;
        }

        try {
            const type = Profile.types[field?.type ?? -1];

            if (Array.isArray(rawFieldValue)) {
                return rawFieldValue.map(value => {
                    return value == null ? value : type?.[value] ?? value
                });
            }

            return type?.[rawFieldValue] ?? rawFieldValue;
        }
        catch {
            return rawFieldValue;
        }
    }

    #lookupSubfield(field, name) {
        const subField = field.subFields.find(subField => subField.name === name);
        return subField != null ? subField : {};
    }

    static #readFileHeader(stream, resetPosition = false) {
        const position = stream.position;

        const fileHeader = {
            headerSize: stream.readByte(),
            protocolVersion: stream.readByte(),
            profileVersion: stream.readUInt16(),
            dataSize: stream.readUInt32(),
            dataType: stream.readString(4),
            headerCRC: 0
        };

        if (fileHeader.headerSize === 14) {
            fileHeader.headerCRC = stream.readUInt16()
        }

        if (resetPosition) {
            stream.seek(position);
        }

        return fileHeader;
    }

    #throwError(error = "") {
        throw Error(`FIT Runtime Error at byte ${this.#stream.position} ${error}`.trimEnd());
    }
}

export default Decoder;
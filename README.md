# Garmin - FIT JavaScript SDK
## FIT SDK Documentation
The FIT SDK documentation is available at [https://developer.garmin.com/fit](https://developer.garmin.com/fit).
## FIT SDK Developer Forum
Share your knowledge, ask questions, and get the latest FIT SDK news in the [FIT SDK Developer Forum](https://forums.garmin.com/developer/).
## FIT JavaScript SDK Requirements
The FIT JavaScript SDK uses ECMAScript module syntax and requires Node.js v14.0 or higher, or a browser with a compatible JavaScript runtime engine.
## Install
```sh
npm install @garmin/fitsdk
```
## Decoder
### Usage
````js
import { Decoder, Stream, Profile, Utils } from '@garmin/fitsdk';

const bytes = [0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00];

const stream = Stream.fromByteArray(bytes);
console.log("isFIT (static method): " + Decoder.isFIT(stream));

const decoder = new Decoder(stream);
console.log("isFIT (instance method): " + decoder.isFIT());
console.log("checkIntegrity: " + decoder.checkIntegrity());

const { messages, errors } = decoder.read();

console.log(errors);
console.log(messages);
````
### Constructor

Decoder objects are created from Streams representing the binary FIT file data to be decoded. See [Creating Streams](#creatingstreams) for more information on constructing Stream objects.

Once a Decoder object is created it can be used to check that the Stream is a FIT file, that the FIT file is valid, and to read the contents of the FIT file.

### isFIT Method

All valid FIT files should include a 12 or 14 byte file header. The 14 byte header is the preferred header size and the most common size used. Bytes 8–11 of the header contain the ASCII values ".FIT". This string can easily be spotted when opening a binary FIT file in a text or hex editor.

````bash
  Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
00000000: 0E 10 43 08 78 06 09 00 2E 46 49 54 96 85 40 00    ..C.x....FIT..@.
00000010: 00 00 00 07 03 04 8C 04 04 86 07 04 86 01 02 84    ................
00000020: 02 02 84 05 02 84 00 01 00 00 19 28 7E C5 95 B0    ...........(~E.0
````

The isFIT method reads the file header and returns true if bytes 8–11 are equal to the ACSII values ".FIT". isFIT provides a quick way to check that the file is a FIT file before attempting to decode the file.

The Decoder class includes a static and instance version of the isFIT method.

### Check Integrity Method

The checkIntegrity method performs three checks on a FIT file:

1. Checks that bytes 8–11 of the header contain the ASCII values ".FIT".
2. Checks that the total file size is equal to Header Size + Data Size + CRC Size.
3. Reads the contents of the file, computes the CRC, and then checks that the computed CRC matches the file CRC.

A file must pass all three of these tests to be considered a valid FIT file. See the [IsFIT(), CheckIntegrity(), and Read() Methods recipe](/fit/cookbook/isfit-checkintegrity-read/) for use-cases where the checkIntegrity method should be used and cases when it might be better to avoid it.

### Read Method
The Read method decodes all message from the input stream and returns an object containing an array of errors encountered during the decoding and a dictionary of decoded messages grouped by message type. Any exceptions encountered during decoding will be caught by the Read method and added to the array of errors.

The Read method accepts an optional options object that can be used to customize how field data is represented in the decoded messages. All options are enabled by default. Disabling options may speed up file decoding. Options may also be enabled or disable based on how the decoded data will be used.

````js
const { messages, errors } = decoder.read({
    mesgListener: (messageNumber, message) => {},
    mesgDefinitionListener: (mesgDefinition) => {},
    fieldDescriptionListener: (key, developerDataIdMesg, fieldDescriptionMesg) => {},
    applyScaleAndOffset: true,
    expandSubFields: true,
    expandComponents: true,
    convertTypesToStrings: true,
    convertDateTimesToDates: true,
    includeUnknownData: false,
    mergeHeartRates: true
});
````
#### mesgListener = (messageNumber, message) => {}
Optional callback function that can be used to inspect or manipulate messages after they are fully decoded and all the options have been applied. The message is mutable and we be returned from the Read method in the messages dictionary.

Example mesgListener callback that tracks the field names across all Record messages.
````js
const recordFields = new Set();

const onMesg = (messageNumber, message) => {
    if (Profile.types.mesgNum[messageNumber] === "record") {
        Object.keys(message).forEach(field => recordFields.add(field));
    }
}

const { messages, errors } = decoder.read({
    mesgListener = onMesg
});

console.log(recordFields);
````
#### mesgDefinitionListener: (mesgDefinition) => {}
Optional callback function that can be used to inspect message defintions as they are decoded from the file.
#### fieldDescriptionListener: (key, developerDataIdMesg, fieldDescriptionMesg) => {}
Optional callback function that can be used to inspect developer field descriptions as they are decoded from the file.
#### applyScaleAndOffset: true | false
When true the scale and offset values as defined in the FIT Profile are applied to the raw field values.
````js
{
  altitude: 1587 // with a scale of 5 and offset of 500 applied
}
````
When false the raw field value is used.
````js
{
  altitude: 10435 // raw value store in file
}
````
#### expandSubFields: true | false
When true subfields are created for fields as defined in the FIT Profile.
````js
{
  event: 'rearGearChange',
  data: 16717829,
  gearChangeData:16717829 // Sub Field of data when event == 'rearGearChange'
}
````
When false subfields are omitted.
````js
{
  event: 'rearGearChange',
  data: 16717829
}
````
#### expandComponents: true | false
When true field components as defined in the FIT Profile are expanded into new fields. expandSubFields must be set to true in order for subfields to be expanded

````js
{
  event: 'rearGearChange'
  data: 16717829,
  gearChangeData:16717829, // Sub Field of data when event == 'rearGearChange
  frontGear: 2, // Expanded field of gearChangeData, bits 0-7
  frontGearNum: 53, // Expanded field of gearChangeData, bits 8-15
  rearGear: 11, // Expanded field of gearChangeData, bits 16-23
  rearGearNum: 1, // Expanded field of gearChangeData, bits 24-31
}
````
When false field components are not expanded.
````js
{
  event: 'rearGearChange',
  data: 16717829,
  gearChangeData: 16717829 // Sub Field of data when event == 'rearGearChange
}
````
#### convertTypesToStrings: true | false
When true field values are converted from raw integer values to the corresponding string values as defined in the FIT Profile.
````js
{ type:'activity'}
````
When false the raw integer value is used.
````js
{ type: 4 }
````
#### convertDateTimesToDates: true | false
When true FIT Epoch values are converted to JavaScript Date objects.
````js
{ timeCreated: {JavaScript Date object} }
````
When false the FIT Epoch value  is used.
````js
{ timeCreated: 995749880 }
````
When false the Utils.convertDateTimeToDate method may be used to convert FIT Epoch values to JavaScript Date objects.
#### includeUnknownData: true | false
When true unknown field values are stored in the message using the field id as the key.
````js
{ 249: 1234} // Unknown field with an id of 249
````
#### mergeHeartRates: true | false
When true automatically merge heart rate values from HR messages into the Record messages. This option requires the applyScaleAndOffset and expandComponents options to be enabled. This option has no effect on the Record messages when no HR messages are present in the decoded messages.
## Creating Streams
Stream objects contain the binary FIT data to be decoded. Streams objects can be created from byte-arrays, ArrayBuffers, and Node.js Buffers. Internally the Stream class uses an ArrayBuffer to manage the byte stream.
#### From a Byte Array
````js
const streamFromByteArray = Stream.fromByteArray([0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00]);
console.log("isFIT: " + Decoder.isFIT(streamFromByteArray));
````
#### From an ArrayBuffer
````js
const uint8Array = new Uint8Array([0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00]);
const streamFromArrayBuffer = Stream.fromArrayBuffer(uint8Array.buffer);
console.log("isFIT: " + Decoder.isFIT(streamFromArrayBuffer));
````
#### From a Node.js Buffer
````js
const buffer = Buffer.from([0x0E, 0x10, 0xD9, 0x07, 0x00, 0x00, 0x00, 0x00, 0x2E, 0x46, 0x49, 0x54, 0x91, 0x33, 0x00, 0x00]);
const streamFromBuffer = Stream.fromBuffer(buffer);
console.log("isFIT: " + Decoder.isFIT(streamFromBuffer));
````
#### From a file using Node.js
````js
const buf = fs.readFileSync('activity.fit');
const streamfromFileSync = Stream.fromBuffer(buf);
console.log("isFIT: " + Decoder.isFIT(streamfromFileSync));
````
## Utils
The Utils object contains both constants and methods for working with decoded messages and fields.
### FIT_EPOCH_MS Constant
The FIT_EPOCH_MS constant represents the number of milliseconds between the Unix Epoch and the FIT Epoch.
````js
const FIT_EPOCH_MS = 631065600000;
````
The FIT_EPOCH_MS value can be used to convert FIT Epoch values to JavaScript Date objects.
````js
const jsDate = new Date(fitDateTime * 1000 + Utils.FIT_EPOCH_MS);
````
### convertDateTimeToDate Method
A convince method for converting FIT Epoch values to JavaScript Date objects.
````js
const jsDate = Utils.convertDateTimeToDate(fitDateTime);
````
## Encoder
### Usage
````js 
// Import the SDK
import { Encoder, Profile} from "@garmin/fitsdk";

// Create an Encoder
const encoder = new Encoder();

//
// Write messages to the output-stream
//
// The message data should match the format returned by
// the Decoder. Field names should be camelCase. The fields 
// definitions can be found in the Profile.
//

// Pass the MesgNum and message data as separate parameters to the onMesg() method
encoder.onMesg(Profile.MesgNum.FILE_ID, {
  manufacturer: "development",
  product: 1,
  timeCreated: new Date(),
  type: "activity",
});

// The writeMesg() method expects the mesgNum to be included in the message data
// Internally, writeMesg() calls onMesg()
encoder.writeMesg({
  mesgNum: Profile.MesgNum.FILE_ID,
  manufacturer: "development",
  product: 1,
  timeCreated: new Date(),
  type: "activity",
});

// Unknown values in the message will be ignored by the Encoder
encoder.onMesg(Profile.MesgNum.FILE_ID, {
  manufacturer: "development",
  product: 1,
  timeCreated: new Date(),
  type: "activity",
  customField: 12345, // This value will be ignored by the Encoder
});

// Subfield values in the message will be ignored by the Encoder
encoder.onMesg(Profile.MesgNum.FILE_ID, {
  manufacturer: "development",
  product: 4440, // This is the main product field, which is a uint16
  garminProduct: "edge1050", // This value will be ignored by the Encoder, use the main field value instead
  timeCreated: new Date(),
  type: "activity",
});

// Closing the encoder returns the file as an UInt8 Array
const uint8Array = encoder.close();

// Write the file to disk,
import * as fs from "fs";
fs.writeFileSync("example.fit", uint8Array);
       
````
See the [Encode Activity Recipe](https://github.com/garmin/fit-javascript-sdk/blob/main/test/encode-activity-recipe.test.js) for a complete example of encoding a FIT Activity file usine the FIT JavaScript SDK.

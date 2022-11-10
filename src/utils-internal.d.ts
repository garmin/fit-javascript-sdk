declare namespace _default {
    export { sanitizeValues };
    export { onlyNullValues };
    export { onlyInvalidValues };
}
export default _default;
declare function sanitizeValues(values: any): any;
declare function onlyNullValues(values: any): any;
declare function onlyInvalidValues(rawFieldValue: any, invalidValue: any): any;

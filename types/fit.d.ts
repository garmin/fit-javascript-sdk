declare namespace _default {
    export { BaseType };
    export { BaseTypeDefinitions };
    export { NumericFieldTypes };
    export { FieldTypeToBaseType };
}
export default _default;
declare namespace BaseType {
    const ENUM: number;
    const SINT8: number;
    const UINT8: number;
    const SINT16: number;
    const UINT16: number;
    const SINT32: number;
    const UINT32: number;
    const STRING: number;
    const FLOAT32: number;
    const FLOAT64: number;
    const UINT8Z: number;
    const UINT16Z: number;
    const UINT32Z: number;
    const BYTE: number;
    const SINT64: number;
    const UINT64: number;
    const UINT64Z: number;
}
declare const BaseTypeDefinitions: {
    0: {
        size: number;
        type: number;
        invalid: number;
    };
    1: {
        size: number;
        type: number;
        invalid: number;
    };
    2: {
        size: number;
        type: number;
        invalid: number;
    };
    131: {
        size: number;
        type: number;
        invalid: number;
    };
    132: {
        size: number;
        type: number;
        invalid: number;
    };
    133: {
        size: number;
        type: number;
        invalid: number;
    };
    134: {
        size: number;
        type: number;
        invalid: number;
    };
    7: {
        size: number;
        type: number;
        invalid: number;
    };
    136: {
        size: number;
        type: number;
        invalid: number;
    };
    137: {
        size: number;
        type: number;
        invalid: number;
    };
    10: {
        size: number;
        type: number;
        invalid: number;
    };
    139: {
        size: number;
        type: number;
        invalid: number;
    };
    140: {
        size: number;
        type: number;
        invalid: number;
    };
    13: {
        size: number;
        type: number;
        invalid: number;
    };
    142: {
        size: number;
        type: number;
        invalid: number;
    };
    143: {
        size: number;
        type: number;
        invalid: number;
    };
    144: {
        size: number;
        type: number;
        invalid: number;
    };
};
declare const NumericFieldTypes: string[];
declare namespace FieldTypeToBaseType {
    import sint8 = BaseType.SINT8;
    export { sint8 };
    import uint8 = BaseType.UINT8;
    export { uint8 };
    import sint16 = BaseType.SINT16;
    export { sint16 };
    import uint16 = BaseType.UINT16;
    export { uint16 };
    import sint32 = BaseType.SINT32;
    export { sint32 };
    import uint32 = BaseType.UINT32;
    export { uint32 };
    import string = BaseType.STRING;
    export { string };
    import float32 = BaseType.FLOAT32;
    export { float32 };
    import float64 = BaseType.FLOAT64;
    export { float64 };
    import uint8z = BaseType.UINT8Z;
    export { uint8z };
    import uint16z = BaseType.UINT16Z;
    export { uint16z };
    import uint32z = BaseType.UINT32Z;
    export { uint32z };
    import byte = BaseType.BYTE;
    export { byte };
    import sint64 = BaseType.SINT64;
    export { sint64 };
    import uint64 = BaseType.UINT64;
    export { uint64 };
    import uint64z = BaseType.UINT64Z;
    export { uint64z };
}

/**
 * Optimize closer we get to standard
 */
export enum TypeMap {
    undefined = 10,
    null,
    true,
    false,
    infinity,
    negativeInfinity,
    NaN,

    uint8 = 20,
    uint16,
    uint32,
    bigint,
    int8,
    int16,
    int32,
    float32,
    float64,

    array8 = 30,
    array16,
    array32,
    // array64,
    // arrayN,

    string8 = 35,
    string16,
    string32,
    // string64,
    // stringN,

    bin8 = 40,
    bin16,
    bin32,
    // bin64,
    // binN,

    date = 50,
    regex = 55,
    // symbol,

    // ref = 60,

    setStart = 70,
    setEnd,
    mapStart,
    mapEnd,
    objectStart,
    objectEnd,
}

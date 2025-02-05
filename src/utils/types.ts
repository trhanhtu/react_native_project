export type str<T extends string> = string & { __brand: T };
export type HomeElement_t = {
    isLightOn: boolean,
    atomicNumber: number,
    symbol: string,
    image: string,
    group: Group_t
    period: Period_t,
    block: Block_t,
    classification: Classification_t,
    meltingPoint: number,
    boilingPoint: number,

}
export type Classification_t = "-" | "kim loại" | "phi kim" | "trung tính";
export type Block_t = "-" | "s" | "p" | "d" | "f";
export type Group_t = "-" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18";
export type Period_t = "-" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "lan" | "act"
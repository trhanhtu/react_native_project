export type str<T extends string> = string & { __brand: T };
export type ViewElement_t = {
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
    yearDiscovered: number,
}

export type DetailElement_t = {
    atomicNumber: number,
    symbol: string,
    image: string,
    group: string
    period: string,
    block: string,
    classification: string,
    name: string,
    atomicMass: string,
    electronicConfiguration: string,
    electronegativity: number,
    atomicRadius: number,
    ionRadius: number,
    vanDelWaalsRadius: number,
    ionizationEnergy: number,
    electronAffinity: number,
    oxidationStates: number[],
    standardState: string,
    bondingType: string,
    meltingPoint: number,
    boilingPoint: number,
    density: number,
    yearDiscovered: number
}

export type TabScreen_t = {
    icon: React.ReactNode,
    name: string,
    component: React.ReactNode,
}

export type Classification_t = "-" | "kim loại" | "phi kim" | "trung tính";
export type Block_t = "-" | "s" | "p" | "d" | "f";
export type Group_t = "-" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "lan" | "act";
export type Period_t = "-" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "lan" | "act"
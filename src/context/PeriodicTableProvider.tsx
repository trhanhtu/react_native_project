import { createContext, useContext, useEffect, useState } from "react";
import GetRandomBetween from "../utils/random";
import { Block_t, Classification_t, DetailElement_t, Group_t, Period_t, ViewElement_t } from "../utils/types";

type PeriodicTableContextType = {
    elements: ViewElement_t[];
    loading: boolean;
};

const PeriodicTableContext = createContext<PeriodicTableContextType | undefined>(undefined);

export const PeriodicTableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [elements, setElements] = useState<ViewElement_t[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch("https://raw.githubusercontent.com/trhanhtu/react_native_project/refs/heads/fake-json/assets/detailElementsArray.json")
            .then((response) => {
                response.json().then((data: DetailElement_t[]) => {
                    const elements: ViewElement_t[] = ConvertDetailElementArrayToViewElementArray(data);

                    setElements(elements);
                });

            })
            .finally(() => setLoading(false));
        // setElements(GenerateDummy());
    }, []);

    return (
        <PeriodicTableContext.Provider value={{ elements, loading }}>
            {children}
        </PeriodicTableContext.Provider>
    );
};

export const usePeriodicTable = () => {
    const context = useContext(PeriodicTableContext);
    if (!context) {
        throw new Error("usePeriodicTable must be used within a PeriodicTableProvider");
    }
    return context;
};

function GenerateDummy(): ViewElement_t[] {
    return Array.from({ length: 118 }, (_, index) => {
        const _meltingPoint = Math.random() * 6001
        const _boilingPoint = Math.random() * 6001 + _meltingPoint;
        return {
            symbol: GenerateSymbol(),
            atomicNumber: index + 1,
            block: GenerateBlock(),
            group: GenerateGroup(),
            period: GeneratePeriod(),
            meltingPoint: ~~_meltingPoint,
            boilingPoint: ~~_boilingPoint,
            classification: GenerateClass(),
            isLightOn: true,

        } as ViewElement_t;
    })
}
function GenerateBlock(): Block_t {
    switch (GetRandomBetween(1, 4)) {
        case 1:
            return "s"
        case 2:
            return "p"
        case 3:
            return "d"
        case 4:
            return "f"
        default:
            return "-";
    }
}

function GenerateGroup(): Group_t {
    return GetRandomBetween(1, 18).toString() as Group_t;
}

function GenerateClass(): Classification_t {
    switch (GetRandomBetween(1, 3)) {
        case 1:
            return "kim loại";
        case 2:
            return "phi kim";
        case 3:
            return "trung tính";
        default:
            return "-";
    }
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function GenerateSymbol(): string {
    return Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function GeneratePeriod(): Period_t {
    const value = GetRandomBetween(1, 9);
    if (value === 9) return "lan";
    if (value === 8) return "act";
    return value.toString() as Period_t;
}
function ConvertDetailElementArrayToViewElementArray(data: DetailElement_t[]): ViewElement_t[] {
    return data.map((element) => ({
        symbol: element.symbol,
        image: element.image,
        atomicNumber: element.atomicNumber,
        block: element.block as Block_t,
        group: element.group as Group_t,
        period: element.period as Period_t,
        meltingPoint: element.meltingPoint,
        boilingPoint: element.boilingPoint,
        classification: element.classification as Classification_t,
        isLightOn: false,
    }));
}



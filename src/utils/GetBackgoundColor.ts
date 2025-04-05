import { ViewElement_t } from "./types";

export default function GetBackgroundColor(element: ViewElement_t): [string, string] {
    if (!element.isLightOn) {
        return ["bg-gray-200/100", "bg-gray-200/100"];
    }
    switch (element.groupNumber) {
        case "1":
            if (element.atomicNumber === 1) return ["bg-custom_oceanBlue/100", "bg-h_label/100"];
            return ["bg-custom_pinkBlush/100", "bg-g1_label/100"];
        case "2":
            return ["bg-custom_softPink/100", "bg-g2_label/100"];
        case "3":
            if (element.atomicNumber === 57) return ["bg-custom_skyAqua/100", "bg-glan_label/100"];
            if (element.atomicNumber === 89) return ["bg-custom_limeGreen/100", "bg-gact_label/100"];
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
        case "12":
            return ["bg-custom_skyBlue/100", "bg-gmetal_label/100"];
        case "13":
            return ["bg-custom_neonYellow/100", "bg-g13_label/100"];
        case "14":
            return ["bg-custom_lavender/100", "bg-g14_label/100"];
        case "15":
            return ["bg-custom_silverGray/100", "bg-g15_label/100"];
        case "16":
            return ["bg-custom_sunsetOrange/100", "bg-g16_label/100"];
        case "17":
            return ["bg-custom_peach/100", "bg-g17_label/100"];
        case "18":
            return ["bg-custom_goldenYellow/100", "bg-g18_label/100"];
        case "act":
            return ["bg-custom_limeGreen/100", "bg-gact_label/100"];
        case "lan":
            return ["bg-custom_skyAqua/100", "bg-glan_label/100"];
        default:
            return ["bg-white/100", "bg-white/100"];
    }
}
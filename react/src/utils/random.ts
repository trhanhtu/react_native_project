
export default function GetRandomBetween(m: number, M: number): number {
    return Math.floor(Math.random() * (M - m + 1) + m);
}

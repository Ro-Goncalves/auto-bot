import { SelicData } from "./selic.data.interface";

export interface SelicAPIResult {
    totalItems: number,
    registros: SelicData[],
    observacoes: string[],
    dataAtual: string
}
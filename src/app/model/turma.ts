export type StatusTurma = 'ABERTA' | 'FECHADA' | 'CANCELADA';

export interface ITurma {
    id?: number;
    codigo: string;
    disciplinaId: number | null;
    nomeDisciplina?: string;
    periodo: string;
    vagasTotais: number | null;
    vagasOcupadas?: number;
    vagasDisponiveis?: number;
    dataInicio: Date | string | null;
    dataFim: Date | string | null;
    status?: StatusTurma;
}

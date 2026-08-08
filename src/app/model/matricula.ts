export type StatusMatricula = 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface IMatricula {
    id: number;
    alunoId: number;
    nomeAluno: string;
    turmaId: number;
    codigoTurma: string;
    nomeDisciplina: string;
    status: StatusMatricula;
    dataMatricula: string;
    dataConfirmacao?: string;
    dataCancelamento?: string;
}

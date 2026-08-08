export interface IAluno {
    id?: number;
    nome: string;
    email: string;
    cpf: string;
    dataNascimento: Date | string | null;
    ativo?: boolean;
}

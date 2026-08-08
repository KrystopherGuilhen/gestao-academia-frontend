export interface IDisciplina {
    id?: number;
    nome: string;
    codigo: string;
    cargaHoraria: number | null;
    cursoId: number | null;
    nomeCurso?: string;
    ativo?: boolean;
}

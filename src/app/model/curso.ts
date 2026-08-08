export interface ICurso {
    id?: number;
    nome: string;
    codigo: string;
    cargaHorariaTotal: number | null;
    ativo?: boolean;
}

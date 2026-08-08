import { Estado } from "src/app/shared/enum/estado.enum";

export interface ITabela {
    nomeTabela: string;
    dados: any[];
    rowData?: any;
    colunas: IColunas[];
    colunasCustom: boolean;
    acoes: boolean;
    acoesCustom?: boolean;
    btnAcoesCustom?: IBtnAcoesCustom[];
    campoOrdenacao: string;
    //carregando: boolean;
    grouping?: boolean;
    camposAgrupar?: IColunas[];
    estado?: Estado;
    rows?: number;          // linhas por página
    first?: number;         // índice do primeiro registro (0‑based)
    totalRecords?: number;  // total de registros disponíveis
    sortField?: string;     // campo de ordenação atual
    sortOrder?: number;     // direção (1 = asc, -1 = desc)
    carregando?: boolean;   // sinaliza p-table o loading
}

export interface IColunas {
    field: string;
    header: string;
    width?: string;
    type?: any;
    arg?: string;
    alignment?: 'text-left' | 'text-center' | 'text-right';
    grouped?: boolean;
    icone?: string;
    mask?: string;
    template?: (rowData: any) => string;
}

export interface IBtnAcoesCustom {
    icon: string;
    tooltip: string;
    class: string;
    btnText: boolean;
    btnCirculo: boolean;
    btnSombreado: boolean;
    btnCor:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'help'
    | 'danger'
    | 'contrast';
    evento: (data, btn?, index?) => void;
}

export interface ISeletorColunas {
    visivel: boolean;
    estilo: {};
    _colunasSelecionadas: any[];
}

interface ICampos {
    field: string;
    header: string;
}

export interface IColunaAgrupar {
    campos: ICampos;
}

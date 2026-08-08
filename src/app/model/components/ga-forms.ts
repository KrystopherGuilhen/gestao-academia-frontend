import { IListas } from './ga-listas';
import { MultiSelectOptions } from './ga-multi-listas';

export interface IForms {
    /** Campo da entidade - field */
    formModel?: string;
    /** Valor de tratamento do data binding - value :. Usado no FormsModule NgModel */
    colSpan?: number;
    descricao?: string;
    tipoDado?:
    | 'texto'
    | 'textoRG'
    | 'textoEstatico'
    | 'textarea'
    | 'numerico'
    | 'data'
    | 'logico'
    | 'lista'
    | 'radio'
    | 'fileupload'
    | 'multiselect'
    | 'dinamico';
    visivel?: boolean;
    obrigatorio?: boolean;
    optInput?: IOptionsInput;
}

interface IOptionsInput {
    modoNumerico?: 'decimal' | 'currency';
    monetario?: 'BRL' | 'USD' | 'EUR';
    locale?: 'pt-BR' | 'en-US' | 'en-IN';
    lista?: IListas[];
    listaLabel?: string;
    listaValue?: string;
    dateFormat?: string;
    minDate?: Date;      // <----- Adicione esta linha
    maxDate?: Date;      // <----- (Opcional, mas recomendado para completude)
    dateIcon?: boolean;
    tipoData?: 'month' | 'year' | 'day' | 'day/month/year';
    placeholder?: string;
    text?: string;
    items?: checkRadioLista[];
    fileUploadHint?: FileUploadHint;
    fileUploadBtn?: FileUploadBtn;
    selecaoMultipla?: boolean; // Adicionada para suportar múltiplas seleções
    mask?: string;
    onClick?: (event) => void;
    onChange?: (event) => void;
    onInput?: (event: Event) => void; 
    onAdicionar?: (event) => void;
    onRemover?: (index: number) => void;
    value?: string;
    tipoCheckbox?: boolean;
    disabled?: boolean;
    textoEstatico?: string;
    estilo?: string;
    rows?: number;       // Número de linhas inicial
    cols?: number;       // Número de colunas
    autoResize?: boolean;// Se ajusta automaticamente o tamanho
    maxLength?: number;  // Comprimento máximo do texto
}

interface checkRadioLista {
    itemValue?: any;
    text?: string;
}

interface TiposPermitidos {
    mimeTypes: string[];
    extensoes: string[];
}

interface FileUploadHint {
    visivel: boolean;
    hints?: any[];
    tiposPermitidos?: TiposPermitidos;
    instrucoes?: string;
}

interface FileUploadBtn {
    visivel: boolean;
    toolTip: string;
    onClick?: (event) => void;
}

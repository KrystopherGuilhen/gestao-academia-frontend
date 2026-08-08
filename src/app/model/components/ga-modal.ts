import { Estado } from "src/app/shared/enum/estado.enum";

export interface IModal {
    titulo?: string,
    exibeModal: boolean,
    largura: string,
    modalCadastro: boolean,
    modalImpressao?: boolean,
    fileUpload: boolean,
}



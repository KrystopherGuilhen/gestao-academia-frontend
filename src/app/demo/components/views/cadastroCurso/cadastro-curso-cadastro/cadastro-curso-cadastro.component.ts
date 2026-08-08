import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IForms } from 'src/app/model/components/ga-forms';
import { IModal } from 'src/app/model/components/ga-modal';
import { ITabela } from 'src/app/model/components/ga-tabelas';
import { ControleService } from 'src/app/shared/services/controle.service';
import { CrudFormsAbstractComponent } from 'src/app/shared/templates/crud-forms-template.abstract';
import { ICurso } from 'src/app/model/curso';

@Component({
    selector: 'ga-cadastro-curso-cadastro',
    templateUrl: '../../../../../shared/templates/crud-forms-template.html',
})
export class CadastroCursoCadastroComponent extends CrudFormsAbstractComponent {
    modalProps: IModal = {
        titulo: 'Cadastrar',
        exibeModal: false,
        largura: '600px',
        modalCadastro: true,
        fileUpload: false,
    };

    filtros: any = {};
    formFiltros: IForms[] = [];
    impressao: any = {};
    formImpressao: IForms[] = [];

    listas: any = {};
    formCadastro: IForms[] = [];

    @Input() tabelaProps: ITabela;
    @Input() cadastro: ICurso;

    constructor(
        requestService: ControleService,
        messageService: MessageService,
        confirmationService: ConfirmationService,
        cdr: ChangeDetectorRef
    ) {
        super(requestService, messageService, confirmationService, cdr);
    }

    public constroiListas(): void {
        // Curso nao possui listas de apoio (dropdowns)
    }

    protected constroiFormulario(): void {
        this.formCadastro = [
            {
                colSpan: 8,
                visivel: true,
                formModel: 'nome',
                descricao: 'Nome do curso',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Ex: Engenharia de Software' },
            },
            {
                colSpan: 4,
                visivel: true,
                formModel: 'codigo',
                descricao: 'Código',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Ex: ENG-SW' },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'cargaHorariaTotal',
                descricao: 'Carga horária total (h)',
                tipoDado: 'numerico',
                obrigatorio: true,
                optInput: { modoNumerico: 'decimal' },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'ativo',
                descricao: 'Situação',
                tipoDado: 'logico',
                optInput: { text: 'Curso ativo', onChange: () => {} },
            },
        ];
    }

    protected tratarCampos(): void {
        if (this.cadastro.ativo === undefined || this.cadastro.ativo === null) {
            this.cadastro.ativo = true;
        }
    }

    protected limparFormulario(): void {}
}

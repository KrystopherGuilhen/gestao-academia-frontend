import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IForms } from 'src/app/model/components/ga-forms';
import { IModal } from 'src/app/model/components/ga-modal';
import { ITabela } from 'src/app/model/components/ga-tabelas';
import { ControleService } from 'src/app/shared/services/controle.service';
import { CrudFormsAbstractComponent } from 'src/app/shared/templates/crud-forms-template.abstract';
import { IAluno } from 'src/app/model/aluno';
import { FuncoesUtils } from 'src/app/shared/utils/funcoes-utils';

@Component({
    selector: 'ga-cadastro-aluno-cadastro',
    templateUrl: '../../../../../shared/templates/crud-forms-template.html',
})
export class CadastroAlunoCadastroComponent extends CrudFormsAbstractComponent {
    modalProps: IModal = {
        titulo: 'Cadastrar',
        exibeModal: false,
        largura: '600px',
        modalCadastro: true,
        fileUpload: false,
    };

    // Nao utilizados nesta tela (sem modal de filtro/impressao dedicado),
    // mas exigidos pelo contrato abstrato da classe base.
    filtros: any = {};
    formFiltros: IForms[] = [];
    impressao: any = {};
    formImpressao: IForms[] = [];

    listas: any = {};
    formCadastro: IForms[] = [];

    @Input() tabelaProps: ITabela;
    @Input() cadastro: IAluno;

    constructor(
        requestService: ControleService,
        messageService: MessageService,
        confirmationService: ConfirmationService,
        cdr: ChangeDetectorRef
    ) {
        super(requestService, messageService, confirmationService, cdr);
    }

    public constroiListas(): void {
        // Aluno nao possui listas de apoio (dropdowns)
    }

    protected constroiFormulario(): void {
        if (typeof this.cadastro?.dataNascimento === 'string') {
            this.cadastro.dataNascimento = FuncoesUtils.converteIsoParaDate(this.cadastro.dataNascimento);
        }

        this.formCadastro = [
            {
                colSpan: 12,
                visivel: true,
                formModel: 'nome',
                descricao: 'Nome completo',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Digite o nome do aluno' },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'email',
                descricao: 'E-mail',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'exemplo@email.com' },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'cpf',
                descricao: 'CPF',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: '000.000.000-00', mask: '000.000.000-00' },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'dataNascimento',
                descricao: 'Data de nascimento',
                tipoDado: 'data',
                obrigatorio: true,
                optInput: { dateFormat: 'dd/mm/yy', dateIcon: true, maxDate: new Date() },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'ativo',
                descricao: 'Situação',
                tipoDado: 'logico',
                optInput: { text: 'Aluno ativo', onChange: () => {} },
            },
        ];
    }

    protected tratarCampos(): void {
        this.cadastro.dataNascimento = FuncoesUtils.converteDateParaIso(this.cadastro.dataNascimento);
        if (this.cadastro.ativo === undefined || this.cadastro.ativo === null) {
            this.cadastro.ativo = true;
        }
    }

    protected limparFormulario(): void {}
}

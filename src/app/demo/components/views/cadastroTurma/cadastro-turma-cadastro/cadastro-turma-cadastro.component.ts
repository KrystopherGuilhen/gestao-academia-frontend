import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IForms } from 'src/app/model/components/ga-forms';
import { IModal } from 'src/app/model/components/ga-modal';
import { ITabela } from 'src/app/model/components/ga-tabelas';
import { ControleService } from 'src/app/shared/services/controle.service';
import { CrudFormsAbstractComponent } from 'src/app/shared/templates/crud-forms-template.abstract';
import { ITurma } from 'src/app/model/turma';
import { FuncoesUtils } from 'src/app/shared/utils/funcoes-utils';
import { Estado } from 'src/app/shared/enum/estado.enum';

@Component({
    selector: 'ga-cadastro-turma-cadastro',
    templateUrl: '../../../../../shared/templates/crud-forms-template.html',
})
export class CadastroTurmaCadastroComponent extends CrudFormsAbstractComponent {
    modalProps: IModal = {
        titulo: 'Cadastrar',
        exibeModal: false,
        largura: '700px',
        modalCadastro: true,
        fileUpload: false,
    };

    filtros: any = {};
    formFiltros: IForms[] = [];
    impressao: any = {};
    formImpressao: IForms[] = [];

    listas: { disciplinas: any[]; status: any[] } = {
        disciplinas: [],
        status: [
            { label: 'Aberta', value: 'ABERTA' },
            { label: 'Fechada', value: 'FECHADA' },
            { label: 'Cancelada', value: 'CANCELADA' },
        ],
    };
    formCadastro: IForms[] = [];

    @Input() tabelaProps: ITabela;
    @Input() cadastro: ITurma;

    constructor(
        requestService: ControleService,
        messageService: MessageService,
        confirmationService: ConfirmationService,
        cdr: ChangeDetectorRef
    ) {
        super(requestService, messageService, confirmationService, cdr);
    }

    public constroiListas(): void {
        this.requestService.getDados('api/disciplinas/todos').subscribe({
            next: (res) => {
                this.listas.disciplinas = (res.dados ?? []).map((disciplina: any) => ({
                    label: `${disciplina.codigo} - ${disciplina.nome}`,
                    value: disciplina.id,
                }));
                this.constroiFormulario();
            },
        });
    }

    protected constroiFormulario(): void {
        if (typeof this.cadastro?.dataInicio === 'string') {
            this.cadastro.dataInicio = FuncoesUtils.converteIsoParaDate(this.cadastro.dataInicio);
        }
        if (typeof this.cadastro?.dataFim === 'string') {
            this.cadastro.dataFim = FuncoesUtils.converteIsoParaDate(this.cadastro.dataFim);
        }

        const emEdicao = this.estado === Estado.alterar || this.estado === Estado.visualizar;

        this.formCadastro = [
            {
                colSpan: 5,
                visivel: true,
                formModel: 'codigo',
                descricao: 'Código da turma',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Ex: ED-2025-2-A' },
            },
            {
                colSpan: 4,
                visivel: true,
                formModel: 'periodo',
                descricao: 'Período',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Ex: 2025.2' },
            },
            {
                colSpan: 3,
                visivel: true,
                formModel: 'vagasTotais',
                descricao: 'Total de vagas',
                tipoDado: 'numerico',
                obrigatorio: true,
                optInput: { modoNumerico: 'decimal' },
            },
            {
                colSpan: 12,
                visivel: true,
                formModel: 'disciplinaId',
                descricao: 'Disciplina',
                tipoDado: 'lista',
                obrigatorio: true,
                optInput: {
                    lista: this.listas.disciplinas,
                    listaLabel: 'label',
                    listaValue: 'value',
                    selecaoMultipla: false,
                    placeholder: 'Selecione a disciplina...',
                },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'dataInicio',
                descricao: 'Data de início',
                tipoDado: 'data',
                obrigatorio: true,
                optInput: { dateFormat: 'dd/mm/yy', dateIcon: true },
            },
            {
                colSpan: 6,
                visivel: true,
                formModel: 'dataFim',
                descricao: 'Data de fim',
                tipoDado: 'data',
                obrigatorio: true,
                optInput: { dateFormat: 'dd/mm/yy', dateIcon: true },
            },
            {
                colSpan: 12,
                // Situacao so faz sentido editar em turmas ja existentes; em uma
                // turma nova ela sempre comeca ABERTA, definido pelo backend.
                visivel: emEdicao,
                formModel: 'status',
                descricao: 'Situação da turma',
                tipoDado: 'lista',
                obrigatorio: false,
                optInput: {
                    lista: this.listas.status,
                    listaLabel: 'label',
                    listaValue: 'value',
                    selecaoMultipla: false,
                    placeholder: 'Selecione a situação...',
                },
            },
        ];
    }

    protected tratarCampos(): void {
        this.cadastro.dataInicio = FuncoesUtils.converteDateParaIso(this.cadastro.dataInicio);
        this.cadastro.dataFim = FuncoesUtils.converteDateParaIso(this.cadastro.dataFim);
    }

    protected limparFormulario(): void {}
}

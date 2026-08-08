import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IForms } from 'src/app/model/components/ga-forms';
import { IModal } from 'src/app/model/components/ga-modal';
import { ITabela } from 'src/app/model/components/ga-tabelas';
import { ControleService } from 'src/app/shared/services/controle.service';
import { CrudFormsAbstractComponent } from 'src/app/shared/templates/crud-forms-template.abstract';
import { IDisciplina } from 'src/app/model/disciplina';

@Component({
    selector: 'ga-cadastro-disciplina-cadastro',
    templateUrl: '../../../../../shared/templates/crud-forms-template.html',
})
export class CadastroDisciplinaCadastroComponent extends CrudFormsAbstractComponent {
    modalProps: IModal = {
        titulo: 'Cadastrar',
        exibeModal: false,
        largura: '650px',
        modalCadastro: true,
        fileUpload: false,
    };

    filtros: any = {};
    formFiltros: IForms[] = [];
    impressao: any = {};
    formImpressao: IForms[] = [];

    listas: { cursos: any[] } = { cursos: [] };
    formCadastro: IForms[] = [];

    @Input() tabelaProps: ITabela;
    @Input() cadastro: IDisciplina;

    constructor(
        requestService: ControleService,
        messageService: MessageService,
        confirmationService: ConfirmationService,
        cdr: ChangeDetectorRef
    ) {
        super(requestService, messageService, confirmationService, cdr);
    }

    public constroiListas(): void {
        this.requestService.getDados('api/cursos/todos').subscribe({
            next: (res) => {
                this.listas.cursos = (res.dados ?? []).map((curso: any) => ({
                    label: `${curso.codigo} - ${curso.nome}`,
                    value: curso.id,
                }));
                this.constroiFormulario();
            },
        });
    }

    protected constroiFormulario(): void {
        this.formCadastro = [
            {
                colSpan: 8,
                visivel: true,
                formModel: 'nome',
                descricao: 'Nome da disciplina',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Ex: Estrutura de Dados' },
            },
            {
                colSpan: 4,
                visivel: true,
                formModel: 'codigo',
                descricao: 'Código',
                tipoDado: 'texto',
                obrigatorio: true,
                optInput: { placeholder: 'Ex: ENG-SW-101' },
            },
            {
                colSpan: 8,
                visivel: true,
                formModel: 'cursoId',
                descricao: 'Curso',
                tipoDado: 'lista',
                obrigatorio: true,
                optInput: {
                    lista: this.listas.cursos,
                    listaLabel: 'label',
                    listaValue: 'value',
                    selecaoMultipla: false,
                    placeholder: 'Selecione o curso...',
                },
            },
            {
                colSpan: 4,
                visivel: true,
                formModel: 'cargaHoraria',
                descricao: 'Carga horária (h)',
                tipoDado: 'numerico',
                obrigatorio: true,
                optInput: { modoNumerico: 'decimal' },
            },
            {
                colSpan: 12,
                visivel: true,
                formModel: 'ativo',
                descricao: 'Situação',
                tipoDado: 'logico',
                optInput: { text: 'Disciplina ativa', onChange: () => {} },
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

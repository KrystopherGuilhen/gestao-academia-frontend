import { ChangeDetectorRef, Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
    ITabela,
    IColunas,
    IBtnAcoesCustom,
} from 'src/app/model/components/ga-tabelas';
import { IToolbar } from 'src/app/model/components/ga-toolbar';
import { ControleService } from 'src/app/shared/services/controle.service';
import { ExportersService } from 'src/app/shared/services/exporters.service';
import { CrudViewAbstractComponent } from 'src/app/shared/templates/crud-view-template.abstract';
import { IMatricula } from 'src/app/model/matricula';

/**
 * Tela de consulta e gestao de matriculas. Diferente das demais telas de
 * cadastro, aqui nao ha criacao/edicao/exclusao via o modal generico: a
 * criacao de uma matricula acontece pelo formulario dedicado acima da
 * tabela (ver MatricularFormComponent) e as unicas acoes sobre um
 * registro existente sao "Confirmar" e "Cancelar", que chamam as regras
 * de negocio protegidas no backend (limite de vagas, status, etc).
 *
 * A busca global da tabela (nome do aluno, codigo da turma, disciplina)
 * cobre a exigencia de "consulta de matriculas por aluno e por turma".
 */
@Component({
    selector: 'ga-matriculas-view',
    templateUrl: '../../../../../shared/templates/crud-view-template.html',
})
export class MatriculasViewComponent extends CrudViewAbstractComponent {
    toolbarProps: IToolbar = {
        minimalista: true,
        btnSombreado: true,
        btnCircular: true,
        apenasXlsx: false,
        tabelaCrud: true,
        podeCriar: false,
        podeExcluir: false,
    };

    tabelaProps: ITabela = {
        nomeTabela: 'api/matriculas',
        dados: [],
        colunas: [],
        colunasCustom: true,
        acoes: true,
        campoOrdenacao: '',
        grouping: false,
        acoesCustom: true,
        camposAgrupar: [],
        rows: 10,
        first: 0,
        totalRecords: 0,
        sortField: '',
        sortOrder: 1,
        carregando: false,
    };

    filtrosGlobais: string[] = ['nomeAluno', 'codigoTurma', 'nomeDisciplina'];

    constructor(
        public override requestService: ControleService,
        public override messageService: MessageService,
        public override confirmationService: ConfirmationService,
        public override exporters: ExportersService,
        public override cdr: ChangeDetectorRef
    ) {
        super(requestService, messageService, confirmationService, exporters, cdr);
    }

    protected constroiColunasDinamicas(colunas: IColunas[]): IColunas[] {
        return (colunas = [
            { field: 'id', header: 'Código', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'nomeAluno', header: 'Aluno', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'codigoTurma', header: 'Turma', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'nomeDisciplina', header: 'Disciplina', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'status', header: 'Status', width: 'auto', alignment: 'text-center', grouped: false },
            { field: 'dataMatricula', header: 'Data da matrícula', width: 'auto', alignment: 'text-left', grouped: false },
        ]);
    }

    protected trataFiltrosGlobais(value: string): any {
        return value;
    }

    protected constroiColunaAcaoCustom(botoes: IBtnAcoesCustom[]): IBtnAcoesCustom[] {
        return [
            {
                icon: 'pi pi-check',
                tooltip: 'Confirmar matrícula',
                class: 'p-button-sm mr-1',
                btnText: true,
                btnCirculo: true,
                btnSombreado: false,
                btnCor: 'success',
                evento: (data) => this.confirmar(data),
            },
            {
                icon: 'pi pi-times',
                tooltip: 'Cancelar matrícula',
                class: 'p-button-sm',
                btnText: true,
                btnCirculo: true,
                btnSombreado: false,
                btnCor: 'danger',
                evento: (data) => this.cancelar(data),
            },
        ];
    }

    protected capturaDescricaoRegistroRemocao(rowData: IMatricula): string {
        return `matrícula de ${rowData.nomeAluno} na turma ${rowData.codigoTurma}`;
    }

    private confirmar(rowData: IMatricula): void {
        if (rowData.status !== 'PENDENTE') {
            this.messageService.add({
                severity: 'info',
                summary: 'Ação não permitida',
                detail: 'Apenas matrículas com status PENDENTE podem ser confirmadas.',
                life: 4000,
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Confirmar a matrícula de <b>${rowData.nomeAluno}</b> na turma <b>${rowData.codigoTurma}</b>? Isso irá consumir uma vaga da turma.`,
            header: 'Confirmar matrícula',
            icon: 'pi pi-check-circle',
            accept: () => {
                this.requestService.putAcao(`api/matriculas/${rowData.id}/confirmar`).subscribe({
                    next: (res: any) => {
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: res.mensagem, life: 3000 });
                        this.recarregaDados();
                    },
                    error: (erro) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Não foi possível confirmar',
                            detail: erro.error?.mensagem || 'Erro ao confirmar matrícula',
                            life: 5000,
                        });
                    },
                });
            },
        });
    }

    private cancelar(rowData: IMatricula): void {
        if (rowData.status === 'CANCELADA') {
            this.messageService.add({
                severity: 'info',
                summary: 'Ação não permitida',
                detail: 'Esta matrícula já está cancelada.',
                life: 4000,
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Cancelar a matrícula de <b>${rowData.nomeAluno}</b> na turma <b>${rowData.codigoTurma}</b>?` +
                (rowData.status === 'CONFIRMADA' ? ' A vaga será liberada automaticamente.' : ''),
            header: 'Cancelar matrícula',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.requestService.putAcao(`api/matriculas/${rowData.id}/cancelar`).subscribe({
                    next: (res: any) => {
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: res.mensagem, life: 3000 });
                        this.recarregaDados();
                    },
                    error: (erro) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Não foi possível cancelar',
                            detail: erro.error?.mensagem || 'Erro ao cancelar matrícula',
                            life: 5000,
                        });
                    },
                });
            },
        });
    }
}

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
import { ITurma } from 'src/app/model/turma';

@Component({
    selector: 'ga-cadastro-turma-view',
    templateUrl: '../../../../../shared/templates/crud-view-template.html',
})
export class CadastroTurmaViewComponent extends CrudViewAbstractComponent {
    toolbarProps: IToolbar = {
        minimalista: true,
        btnSombreado: true,
        btnCircular: true,
        apenasXlsx: false,
        tabelaCrud: true,
        podeCriar: true,
        podeExcluir: true,
    };

    tabelaProps: ITabela = {
        nomeTabela: 'api/turmas',
        dados: [],
        colunas: [],
        colunasCustom: true,
        acoes: true,
        campoOrdenacao: '',
        grouping: false,
        acoesCustom: false,
        camposAgrupar: [],
        rows: 10,
        first: 0,
        totalRecords: 0,
        sortField: '',
        sortOrder: 1,
        carregando: false,
    };

    filtrosGlobais: string[] = ['codigo', 'nomeDisciplina', 'periodo', 'status'];

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
            { field: 'codigo', header: 'Turma', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'nomeDisciplina', header: 'Disciplina', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'periodo', header: 'Período', width: 'auto', alignment: 'text-left', grouped: false },
            { field: 'vagasOcupadas', header: 'Vagas ocupadas', width: 'auto', alignment: 'text-center', grouped: false },
            { field: 'vagasTotais', header: 'Vagas totais', width: 'auto', alignment: 'text-center', grouped: false },
            { field: 'status', header: 'Status', width: 'auto', alignment: 'text-center', grouped: false },
        ]);
    }

    protected trataFiltrosGlobais(value: string): any {
        return value;
    }

    protected constroiColunaAcaoCustom(botoes: IBtnAcoesCustom[]): IBtnAcoesCustom[] {
        return botoes;
    }

    protected capturaDescricaoRegistroRemocao(rowData: ITurma): string {
        return rowData.codigo;
    }
}

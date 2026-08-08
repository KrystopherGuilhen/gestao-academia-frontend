import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    inject,
    Injector,
    NgZone,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { CrudAbstractComponent } from './crud-template.abstract';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { ListboxChangeEvent } from 'primeng/listbox';
import { Table } from 'primeng/table';
import {
    ITabela,
    ISeletorColunas,
    IColunaAgrupar,
    IColunas,
    IBtnAcoesCustom,
} from 'src/app/model/components/ga-tabelas';
import { IToolbar } from 'src/app/model/components/ga-toolbar';
import { Estado } from '../enum/estado.enum';
import { ControleService, Paginado } from '../services/controle.service';
import { ExportersService } from '../services/exporters.service';

@Directive()
export abstract class CrudViewAbstractComponent
    extends CrudAbstractComponent
    implements OnInit {
    @ViewChild('dt', { static: false }) tabela: Table;
    @ViewChild('cm', { static: false }) contextMenu: ContextMenu;
    @ViewChild('groupBtn', { static: false }) groupBtn: HTMLElement;
    abstract toolbarProps: IToolbar;
    abstract tabelaProps: ITabela;
    abstract filtrosGlobais: string[];
    estado!: Estado;
    exportMenu: MenuItem[] = [];
    menuContextoTabela: MenuItem[] = [];
    seletorColunas: ISeletorColunas = {
        visivel: false,
        estilo: {},
        _colunasSelecionadas: [],
    };
    colunaAgrupar: IColunaAgrupar = { campos: { field: '', header: '' } };

    @Output() emitModalFiltro: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitModalCadastro: EventEmitter<string> = new EventEmitter<string>();
    @Output() emitModalImpressao: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitDadosCadastro: EventEmitter<any> = new EventEmitter<any>();

    protected ngZone: NgZone = inject(NgZone);

    constructor(
        public override requestService: ControleService,
        public override messageService: MessageService,
        public override confirmationService: ConfirmationService,
        public exporters: ExportersService,
        public override cdr: ChangeDetectorRef
    ) {
        super(requestService, messageService, confirmationService, cdr);
    }

    // public loadLazy(event: LazyLoadEvent): void {
    //     this.tabelaProps.carregando = true;

    //     const page = (event.first! / event.rows!) || 0;
    //     const size = event.rows!;                 // linhas por página
    //     const sortField = event.sortField as string; // campo de ordenação
    //     const sortOrder = event.sortOrder as number; // 1 ou -1
    //     const filter = event.globalFilter as string;// texto do filtro global

    //     this.requestService
    //         .getPaginado<any>(
    //             this.tabelaProps.nomeTabela,
    //             page,
    //             size,
    //             sortField,
    //             sortOrder,
    //             filter
    //         )
    //         .subscribe({
    //             next: ({ data, total }: Paginado<any>) => {
    //                 this.tabelaProps.dados = data;
    //                 this.tabelaProps.totalRecords = total;
    //                 this.tabelaProps.first = page * size;
    //                 this.tabelaProps.sortField = sortField;
    //                 this.tabelaProps.sortOrder = sortOrder;
    //                 this.tabelaProps.carregando = false;
    //                 this.cdr.markForCheck();
    //             },
    //             error: () => {
    //                 this.tabelaProps.carregando = false;
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Erro',
    //                     detail: 'Falha ao carregar registros paginados'
    //                 });
    //             }
    //         });
    // }

    // /**
    //  * Substitui a carga “antiga” de todos os dados pela chamada lazy.
    //  */
    // public retornaDados(tabelaProps: ITabela, filtros?: string): void {
    //     this.loadLazy({
    //         first: tabelaProps.first,
    //         rows: tabelaProps.rows,
    //         sortField: tabelaProps.sortField,
    //         sortOrder: tabelaProps.sortOrder,
    //         globalFilter: filtros || ''
    //     } as LazyLoadEvent);
    // }

    ngOnInit(): void {
        this.toolbarProps.minimalista
            ? (this.toolbarProps.btnSombreado = false)
            : null;

        // dispara página 0, sem filtro e mantendo sortField/sortOrder defaults
        this.retornaDadosPaginados(
            this.tabelaProps,
            {
                first: this.tabelaProps.first || 0,
                rows: this.tabelaProps.rows || 10,
                sortField: this.tabelaProps.sortField,
                sortOrder: this.tabelaProps.sortOrder,
                globalFilter: ''
            }
        );
        this.constroiExportMenu();
        this.constroiColunasGenericas();
        this.constroiContextoMenuTabela();

        this.seletorColunas._colunasSelecionadas = this.tabelaProps.colunas;
    }

    get colunasSelecionadas(): any[] {
        return this.seletorColunas._colunasSelecionadas;
    }

    set colunasSelecionadas(val: any[]) {
        this.seletorColunas._colunasSelecionadas =
            this.tabelaProps.colunas.filter((col) => val.includes(col));
    }

    public recarregaDados(): void {
        this.tabela.clear();
        this.tabela.clearState();
        this.tabela.ngOnDestroy();
        this.selecionados = [];
        this.tabelaProps.colunas.forEach((col) =>
            col.field === this.tabelaProps.campoOrdenacao
                ? (col.icone = 'pi pi-sort-alt')
                : null
        );
        //this.retornaTodosDados(this.tabelaProps);
        this.retornaDadosPaginados(
            this.tabelaProps,
            {
                first: 0,                // volta para a primeira página
                rows: this.tabelaProps.rows!,
                sortField: this.tabelaProps.sortField,
                sortOrder: this.tabelaProps.sortOrder,
                globalFilter: ''
            }
        );
        this.constroiColunasGenericas();
    }

    protected constroiColunasGenericas(): void {
        if (this.tabelaProps.colunasCustom) {
            this.tabelaProps.colunas = this.constroiColunasDinamicas(
                this.tabelaProps.colunas
            );
            this.tabelaProps.colunas.forEach(
                (col) => (col.icone = 'pi pi-sort-alt')
            );
        }

        this.constroiColunaAcoes(
            this.tabelaProps.colunas,
            this.tabelaProps.acoes
        );

        if (this.tabelaProps.acoes && this.tabelaProps.acoesCustom) {
            this.tabelaProps.btnAcoesCustom = this.constroiColunaAcaoCustom(
                this.tabelaProps.btnAcoesCustom
            );
        }
    }

    public removeRegistrosSelecionados(): void {
        this.requisicaoRemocaoMultipla(this.tabelaProps);
    }

    public chamaModalFiltros(): void {
        this.emitModalFiltro.emit();
    }

    public chamaModalNovoRegistro(): void {
        this.estado = Estado.novo;
        this.tabelaProps.estado = this.estado;
        this.emitModalCadastro.emit();
    }

    public chamaModalVisualizacao(rowData: any): void {
        this.estado = Estado.visualizar;
        this.tabelaProps.estado = this.estado;
        this.emitModalCadastro.emit();
        this.emitDadosCadastro.emit(rowData);
    }

    public chamaModalAlteracao(rowData: any): void {
        this.estado = Estado.alterar;
        this.tabelaProps.estado = this.estado;
        this.emitModalCadastro.emit();
        this.emitDadosCadastro.emit(rowData);
    }

    public removeRegistro(rowData: any): void {
        const descricao: string = this.capturaDescricaoRegistroRemocao(rowData);
        this.requisicaoRemocao(descricao, this.tabelaProps, rowData);
    }

    // public chamaModalImpressao(rowData: any): void {
    //     this.estado = Estado.impressao;
    //     this.tabelaProps.estado = this.estado;
    //     this.emitDadosCadastro.emit(rowData);
    //     this.cdr.detectChanges();

    //     // Abre o modal dentro da zona Angular com um pequeno delay
    //     this.ngZone.runOutsideAngular(() => {
    //         setTimeout(() => {
    //             this.ngZone.run(() => {
    //                 this.emitModalImpressao.emit(rowData);
    //                 this.cdr.detectChanges();
    //             });
    //         }, 100);
    //     });

    // }

    public chamaModalImpressao(rowData: any): void {
        this.estado = Estado.impressao;
        this.tabelaProps.estado = this.estado;

        // Emite os dados primeiro
        this.emitDadosCadastro.emit(rowData);
        this.cdr.detectChanges();

        // Emite o evento para abrir a modal após os dados estarem prontos
        setTimeout(() => {
            this.emitModalImpressao.emit(rowData);
            this.cdr.detectChanges(); // Força a atualização
        }, 100);
    }

    private constroiExportMenu(): void {
        if (this.toolbarProps.apenasXlsx) {
            this.exportMenu = [
                {
                    label: 'Exportar todas as linhas Excel',
                    icon: 'pi pi-file-excel',
                    command: () =>
                        this.exportador(this.tabelaProps.dados, true, 'excel'),
                },
                {
                    label: 'Exportar linhas selecionadas Excel',
                    icon: 'pi pi-file-excel',
                    command: () =>
                        this.exportador(this.selecionados, false, 'excel'),
                },
            ];
        } else {
            this.exportMenu = [
                {
                    label: 'Exportar todas as linhas Excel',
                    icon: 'pi pi-file-excel',
                    command: () =>
                        this.exportador(this.tabelaProps.dados, true, 'excel'),
                },
                {
                    label: 'Exportar linhas selecionadas Excel',
                    icon: 'pi pi-file-pdf',
                    command: () =>
                        this.exportador(this.selecionados, false, 'excel'),
                },
                {
                    label: 'Exportar todas as linhas PDF',
                    icon: 'pi pi-file-pdf',
                    command: () =>
                        this.exportador(this.tabelaProps.dados, true, 'pdf'),
                },
                {
                    label: 'Exportar linhas selecionadas PDF',
                    icon: 'pi pi-file-pdf',
                    command: () =>
                        this.exportador(this.selecionados, false, 'pdf'),
                },
                {
                    label: 'Exportar todas as linhas TXT',
                    icon: 'pi pi-file-word',
                    command: () =>
                        this.exportador(this.tabelaProps.dados, true, 'txt'),
                },
                {
                    label: 'Exportar linhas selecionadas TXT',
                    icon: 'pi pi-file-word',
                    command: () =>
                        this.exportador(this.selecionados, false, 'txt'),
                },
            ];
        }
    }

    private constroiContextoMenuTabela(): void {
        this.menuContextoTabela = [
            {
                label: 'Ordenação crescente',
                icon: 'pi pi-sort-amount-up',
                command: () => this.ordenacao(1),
            },
            {
                label: 'Ordenação decrescente',
                icon: 'pi pi-sort-amount-down',
                command: () => this.ordenacao(-1),
            },
            {
                label: 'Limpar ordenação',
                icon: 'pi pi-sort-alt-slash',
                command: () => this.limparOrdenacaoTabela(),
            },
        ];

        if (
            !this.tabelaProps.camposAgrupar.some(
                (campo) => campo.field === this.colunaAgrupar.campos.field
            )
        ) {
            // this.menuContextoTabela.push({
            //     label: 'Agrupar pela coluna',
            //     icon: 'pi pi-sitemap',
            //     command: () => this.agruparPelaColuna(),
            // });
        } else {
            const index = this.tabelaProps.camposAgrupar.findIndex(
                (el) => el === this.colunaAgrupar.campos
            );
            this.menuContextoTabela.push({
                label: 'Remover Agrupamento',
                icon: 'pi pi-sitemap',
                command: () => {
                    this.tabelaProps.colunas.forEach((col) =>
                        col.field === this.colunaAgrupar.campos.field
                            ? (col.grouped = false)
                            : null
                    );
                    this.tabelaProps.camposAgrupar.splice(index, 1);
                },
            });
        }
    }

    private limparOrdenacaoTabela(): void {
        this.tabelaProps.colunas.forEach((col) =>
            col.field === this.tabelaProps.campoOrdenacao
                ? (col.icone = 'pi pi-sort-alt')
                : null
        );
        this.tabela.reset();
        //this.retornaTodosDados(this.tabelaProps);
        this.tabelaProps.campoOrdenacao = '';
        this.tabelaProps.sortField = '';
        this.tabelaProps.sortOrder = 1;

        this.retornaDadosPaginados(
            this.tabelaProps,
            {
                first: this.tabelaProps.first!,
                rows: this.tabelaProps.rows!,
                sortField: '',
                sortOrder: 1,
                globalFilter: ''
            }
        );
    }

    private ordenacao(sortOrder: number): void {
        if (this.tabela) {
            this.tabela.sortField = this.tabelaProps.campoOrdenacao;
            this.tabela.sortOrder = sortOrder;
            this.tabela.sortSingle();
        }
    }

    public agruparPelaColuna(): void {
        this.tabelaProps.grouping = true;

        if (
            !this.tabelaProps.camposAgrupar.includes(this.colunaAgrupar.campos)
        ) {
            this.tabelaProps.camposAgrupar.push(this.colunaAgrupar.campos);
            this.tabelaProps.camposAgrupar.map((agp) =>
                this.tabelaProps.colunas.map((col) =>
                    col.field === agp.field ? (col.grouped = true) : null
                )
            );

            this.tabelaProps.dados = this.tabelaProps.dados.sort((a, b) => {
                for (let coluna of this.tabelaProps.camposAgrupar) {
                    const aValue = this.resolveFieldData(a, coluna.field);
                    const bValue = this.resolveFieldData(b, coluna.field);
                    if (aValue < bValue) return -1;
                    if (aValue > bValue) return 1;
                }

                return 0;
            });
        }
    }

    public resolveFieldData(data: any, field: string): any {
        if (data && field) {
            if (field.indexOf('.') == -1) {
                return data[field];
            } else {
                let fields = field.split('.');
                let value = data;
                for (let i = 0, len = fields.length; i < len; ++i) {
                    value = value[fields[i]];
                }
                return value;
            }
        } else {
            return null;
        }
    }

    public onRightClick(coluna: { field: string; header: string }): void {
        this.tabelaProps.campoOrdenacao = coluna.field;
        this.colunaAgrupar.campos = coluna;

        this.constroiContextoMenuTabela();
    }

    public filtroGlobal(event: any): void {
        const filtro = this.trataFiltrosGlobais(event.target.value);
        this.tabela.filterGlobal(filtro, 'contains');
    }

    public exibeModalSeletorColunas(event: MouseEvent): void {
        this.seletorColunas.visivel = !this.seletorColunas.visivel;
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        this.seletorColunas.estilo = {
            position: 'absolute',
            top: `${rect.bottom + 8}px`,
            left: `${rect.left - 250}px`,
            transform: 'none',
        };
    }

    public exportador(
        dados: any[],
        todosDados: boolean,
        tipo: 'excel' | 'pdf' | 'txt'
    ): void {
        if (todosDados || (!todosDados && dados.length > 0)) {
            if (tipo === 'excel') {
                this.exporters.exportToExcel(
                    dados,
                    this.tabelaProps.nomeTabela,
                    this.colunasSelecionadas
                );
            } else if (tipo === 'pdf') {
                this.exporters.exportToPdf(
                    dados,
                    this.tabelaProps.nomeTabela,
                    this.colunasSelecionadas
                );
            } else if (tipo === 'txt') {
                this.exporters.exportToTxt(
                    dados,
                    this.tabelaProps.nomeTabela,
                    this.colunasSelecionadas
                );
            }
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Selecione ao menos uma linha para exportar!',
                life: 3000,
            });
        }
    }

    public selecaoLinhaPorClique(rowData: any): void {
        this.selecionados = [];
        this.selecionados.push(rowData);

        const storage: Storage = this.tabela.getStorage();
        if (storage.length > 0) {
            const json = JSON.parse(
                storage.getItem(this.tabelaProps.nomeTabela)
            );

            json.selection = this.selecionados;
            storage.setItem(this.tabelaProps.nomeTabela, JSON.stringify(json));
        } else {
            this.tabela.selection = this.selecionados;
            this.tabela.saveState();
        }
    }

    public ordenacaoColunaAgrupada(col: IColunas): void {
        let sortOrder: number;
        this.tabelaProps.campoOrdenacao = col.field;

        if (
            col.icone === 'pi pi-sort-alt' ||
            col.icone === 'pi pi-sort-amount-down-alt text-blue-500'
        ) {
            col.icone = 'pi pi-sort-amount-up text-blue-500';
            sortOrder = 1;
        } else if (col.icone === 'pi pi-sort-amount-up text-blue-500') {
            col.icone = 'pi pi-sort-amount-down-alt text-blue-500';
            sortOrder = -1;
        }

        this.ordenacao(sortOrder);
    }

    public constroiColunasSeletor(): any[] {
        let colunas: IColunas[] = this.tabelaProps.colunas.filter(
            (col) => col.field !== 'edit'
        );
        return colunas;
    }

    public SelecionaTodasColunas(event: ListboxChangeEvent): void {
        const colunaAcao: IColunas = this.tabelaProps.colunas.find(
            (col) => col.field === 'edit'
        );
        this.colunasSelecionadas.push(colunaAcao);
    }

    protected abstract capturaDescricaoRegistroRemocao(cadastro: any): string;
    protected abstract constroiColunaAcaoCustom(
        botoes: IBtnAcoesCustom[]
    ): IBtnAcoesCustom[];
    protected abstract constroiColunasDinamicas(
        colunas: IColunas[]
    ): IColunas[];
    protected abstract trataFiltrosGlobais(value: any): any;
}

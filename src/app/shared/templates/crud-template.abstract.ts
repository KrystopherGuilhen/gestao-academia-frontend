import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { ChangeDetectorRef, Directive, EventEmitter, Output } from '@angular/core';
import { IModal } from 'src/app/model/components/ga-modal';
import { ITabela, IColunas } from 'src/app/model/components/ga-tabelas';
import { ControleService, Paginado } from '../services/controle.service';
import { Estado } from '../enum/estado.enum';

@Directive()
export abstract class CrudAbstractComponent {
    selecionados: any[] = [];
    @Output() emiteNovoFormulario: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public requestService: ControleService,
        public messageService: MessageService,
        public confirmationService: ConfirmationService,
        public cdr: ChangeDetectorRef
    ) { }

    /**
       * Carrega todos os dados de uma vez (sem paginação)
       */
    public retornaTodosDados(tabelaProps: ITabela, filtros?: string): void {
        tabelaProps.carregando = true;
        const request: string = filtros
            ? `${tabelaProps.nomeTabela}${filtros}`
            : tabelaProps.nomeTabela;

        this.requestService.getDados(request).subscribe({
            next: (res: any) => {
                tabelaProps.dados = res.dados;
                tabelaProps.carregando = false;
                this.constroiColunasPorRequisicao(tabelaProps);
            },
            error: (error: any) => {
                tabelaProps.carregando = false;
                console.error(error);
            }
        });
    }

    /**
     * Carrega dados de forma paginada e com filtro via LazyLoadEvent
     */
    public retornaDadosPaginados(
        tabelaProps: ITabela,
        event: LazyLoadEvent,
        filtrosGlobais?: string
    ): void {
        tabelaProps.carregando = true;

        const page = (event.first! / event.rows!) || 0;
        const size = event.rows!;
        const sortField = event.sortField as string;
        const sortOrder = event.sortOrder as number;
        const filter = (filtrosGlobais ?? event.globalFilter) as string;

        this.requestService
            .getPaginado<any>(
                tabelaProps.nomeTabela,
                page,
                size,
                sortField,
                sortOrder,
                filter
            )
            .subscribe({
                next: (res: any) => {
                    const data = res?.dados?.data ?? [];
                    const total = res?.dados?.total ?? 0;

                    tabelaProps.dados = data;
                    tabelaProps.totalRecords = total;
                    tabelaProps.first = page * size;
                    tabelaProps.sortField = sortField;
                    tabelaProps.sortOrder = sortOrder;
                    tabelaProps.carregando = false;

                    this.cdr.markForCheck();
                },
                error: () => {
                    tabelaProps.carregando = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Falha ao carregar registros paginados',
                    });
                }
            });
    }

    public requisicaoRemocao(
        descricao: string,
        tabelaProps: ITabela,
        data: any
    ): void {
        this.confirmationService.confirm({
            message: `Tem certeza de que deseja remover o registro <b>${descricao}</b>?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.requestService
                    .deleteDados(tabelaProps.nomeTabela, data.id)
                    .subscribe({
                        next: (res: any) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Sucesso',
                                detail: res.mensagem,
                                life: 3000,
                            });
                            const event: LazyLoadEvent = {
                                first: 0, // Começa da primeira página
                                rows: 10, // Tamanho padrão de página
                                sortField: tabelaProps.sortField,
                                sortOrder: tabelaProps.sortOrder
                            };

                            this.retornaDadosPaginados(tabelaProps, event);
                        },
                        error: (res) => {
                            this.messageService.add({
                                severity: 'danger',
                                summary: 'Erro',
                                detail: res.error.mensagem,
                                life: 3000,
                            });
                        },
                    });
            },
        });
    }

    public requisicaoRemocaoMultipla(tabelaProps: ITabela): void {
        // Extrai os IDs dos itens selecionados
        const ids = this.selecionados.map((item: any) => item.id);

        // Confirma a remoção com o usuário
        this.confirmationService.confirm({
            message: `Tem certeza de que deseja remover os <b>${ids.length}</b> registros?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Faz a requisição para o back-end com o array de IDs
                this.requestService
                    .deleteMultiploDados(tabelaProps.nomeTabela, ids)
                    .subscribe({
                        next: (res: any) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Sucesso',
                                detail: res.mensagem,
                                life: 3000,
                            });
                            // Atualiza os dados e limpa a seleção
                            this.selecionados = [];
                            const event: LazyLoadEvent = {
                                first: 0, // Começa da primeira página
                                rows: 10, // Tamanho padrão de página
                                sortField: tabelaProps.sortField,
                                sortOrder: tabelaProps.sortOrder
                            };

                            this.retornaDadosPaginados(tabelaProps, event);
                        },
                        error: (res) => {
                            this.messageService.add({
                                severity: 'danger',
                                summary: 'Erro',
                                detail: res.error.mensagem,
                                life: 3000,
                            });
                        },
                    });
            },
        });
    }

    public requisicaoSalvar(
        modalProps: IModal,
        cadastro: any,
        tabelaProps: ITabela
    ): void {
        this.confirmationService.confirm({
            message: 'Deseja salvar o registro?',
            header: 'Salvar',
            icon: 'pi pi-save',
            accept: () => {
                if (tabelaProps.estado === Estado.novo) {
                    this.requestService
                        .postDados(tabelaProps.nomeTabela, cadastro)
                        .subscribe({
                            next: (res) => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Sucesso',
                                    detail: res.mensagem,
                                    life: 3000,
                                });
                                modalProps.exibeModal = false;
                                const event: LazyLoadEvent = {
                                    first: 0, // Começa da primeira página
                                    rows: 10, // Tamanho padrão de página
                                    sortField: tabelaProps.sortField,
                                    sortOrder: tabelaProps.sortOrder
                                };

                                this.retornaDadosPaginados(tabelaProps, event);
                                const formulario = {
                                    submitted: true,
                                    cadastro: cadastro,
                                };
                                this.emiteNovoFormulario.emit(formulario);
                            },
                            error: (res) => {
                                this.messageService.add({
                                    severity: 'danger',
                                    summary: 'Erro',
                                    detail: res.error.mensagem,
                                    life: 3000,
                                });
                            },
                        });
                } else if (tabelaProps.estado === Estado.alterar) {
                    this.requestService
                        .putDados(tabelaProps.nomeTabela, cadastro.id, cadastro)
                        .subscribe({
                            next: (res) => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Sucesso',
                                    detail: res.mensagem,
                                    life: 3000,
                                });
                                modalProps.exibeModal = false;
                                const event: LazyLoadEvent = {
                                    first: 0, // Começa da primeira página
                                    rows: 10, // Tamanho padrão de página
                                    sortField: tabelaProps.sortField,
                                    sortOrder: tabelaProps.sortOrder
                                };

                                this.retornaDadosPaginados(tabelaProps, event);
                                const formulario = {
                                    submitted: true,
                                    cadastro: cadastro,
                                };
                                this.emiteNovoFormulario.emit(formulario);
                            },
                            error: (res) => {
                                this.messageService.add({
                                    severity: 'danger',
                                    summary: 'Erro',
                                    detail: res.error.mensagem,
                                    life: 3000,
                                });
                            },
                        });
                }
            },
            reject: () => {
                modalProps.exibeModal = true;

                const formulario = { submitted: false, cadastro: cadastro };
                this.emiteNovoFormulario.emit(formulario);
            },
        });
    }

    public requisicaoUploadArquivo(modalProps: IModal, cadastro: any, tabelaProps: ITabela, formData: FormData): void {
        // Chama o método uploadArquivo do ControleService.
        // Por exemplo, se tabelaProps.nomeTabela for 'trabalhadores', a URL será 'http://localhost:8080/trabalhadores/upload'
        this.requestService.uploadArquivo(tabelaProps.nomeTabela, formData).subscribe({
            next: (res: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Upload realizado',
                    detail: res.mensagem,
                    life: 3000,
                });
                modalProps.exibeModal = false;
                this.retornaTodosDados(tabelaProps);
                const formulario = {
                    submitted: true,
                    cadastro: cadastro,
                };
                this.emiteNovoFormulario.emit(formulario);
                // // Criar uma nova instância para forçar a atualização da UI
                // modalProps = { ...modalProps, exibeModal: false };
                // this.cdr.detectChanges(); // Força a atualização da UI
                // this.retornaDados(tabelaProps);
                // const formulario = {
                //     submitted: true,
                //     cadastro: cadastro,
                // };
                // this.emiteNovoFormulario.emit(formulario);
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro no upload',
                    detail: err.error?.mensagem || 'Erro ao enviar arquivo',
                    life: 3000,
                });
            }
        });
    }

    private constroiColunasPorRequisicao(tabelaProps: ITabela): void {
        if (!tabelaProps.colunasCustom && tabelaProps.dados.length) {
            const reqColunas: IColunas[] = [];
            Object.keys(tabelaProps.dados[0]).forEach(key => {
                const header = key.replace(/_/g, ' ').replace(/^[a-z]/, c => c.toUpperCase());
                reqColunas.push({ field: key, header, width: 'auto' });
            });
            tabelaProps.colunas = reqColunas;
            this.constroiColunaAcoes(tabelaProps.colunas, tabelaProps.acoes);
        }
    }

    public constroiColunaAcoes(colunas: IColunas[], acoes: boolean): void {
        if (colunas.length > 0 && acoes) {
            colunas.push({ field: 'edit', header: 'Ações', width: '50px' });
        }
    }

    isBoolean(value: any): boolean {
        return typeof value === 'boolean';
    }
}

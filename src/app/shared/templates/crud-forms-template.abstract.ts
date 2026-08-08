import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { ControleService } from '../services/controle.service';
import { CrudAbstractComponent } from './crud-template.abstract';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { IForms } from 'src/app/model/components/ga-forms';
import { IModal } from 'src/app/model/components/ga-modal';
import { ITabela } from 'src/app/model/components/ga-tabelas';
import { Estado } from '../enum/estado.enum';
import { UploadEvent } from 'src/app/model/components/ga-upload';
import { MyFile } from 'src/app/model/components/ga-upload';
import { ExportersService } from '../services/exporters.service';
import { Observable, of } from 'rxjs';

@Directive()
export abstract class CrudFormsAbstractComponent
    extends CrudAbstractComponent
    implements OnInit, OnChanges {
    @Input() abstract modalProps: IModal;
    abstract filtros: any;
    abstract formFiltros: IForms[];
    abstract listas: any;
    abstract formCadastro: IForms[];
    abstract formImpressao: IForms[];
    abstract cadastro: any;
    abstract impressao: any;
    abstract tabelaProps: ITabela;
    @Input() nomeTabela!: string;
    @Input() estado!: Estado;
    @Output() emitCancelarCadastro: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitFiltro: EventEmitter<any> = new EventEmitter<any>();
    @Output() emitModalImpressao: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        requestService: ControleService,
        messageService: MessageService,
        confirmationService: ConfirmationService,
        cdr: ChangeDetectorRef,
        protected exportersService?: ExportersService
    ) {
        super(requestService, messageService, confirmationService, cdr);
    }

    ngOnInit(): void {
        this.constroiListas();
        this.constroiFormulario();

        this.retornaDadosPaginados(this.tabelaProps, {
            first: 0,
            rows: this.tabelaProps.rows,
            sortField: this.tabelaProps.sortField,
            sortOrder: this.tabelaProps.sortOrder,
            globalFilter: ''  // ou algum valor inicial
        } as LazyLoadEvent);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('estado')) {
            this.estado = changes['estado'].currentValue;

            if (this.estado === Estado.novo) {
                this.modalProps.titulo = 'Cadastrar';
            } else if (this.estado === Estado.visualizar) {
                this.modalProps.titulo = 'Visualizar';
            } else if (this.estado === Estado.alterar) {
                this.modalProps.titulo = 'Editar';
            } else if (this.estado === Estado.impressao) {
                this.modalProps.titulo = 'Imprimir';
            }
        }

        this.constroiFormulario();
    }

    public salvar(): void {
        // Valida campos antes de prosseguir
        if (!this.validarCamposObrigatorios()) {
            return;
        }

        this.tratarCampos();
        this.requisicaoSalvar(this.modalProps, this.cadastro, this.tabelaProps);
    }

    public cancelar(): void {
        this.modalProps.exibeModal = !this.modalProps.exibeModal;
        this.modalProps.fileUpload = false;
        this.emitCancelarCadastro.emit(this.cadastro);
    }

    // public filtrar(): void {
    //     if (!this.validarCamposObrigatorios()) { // Adicione esta linha
    //         return;
    //     }

    //     this.tratarCampos();

    //     const filtrosCampos: string[] = Object.keys(this.filtros);
    //     const filtrosValores: any[] = Object.values(this.filtros);

    //     let queryParams: string[] = [];

    //     filtrosCampos.forEach((campo, index) => {
    //         const valor = filtrosValores[index];
    //         queryParams.push(`${campo}=${valor}`);
    //     });

    //     const filtros = `?${queryParams.join('&')}`;

    //     this.retornaTodosDados(this.tabelaProps, filtros);
    //     this.limparFormulario();

    //     this.modalProps.exibeModal = !this.modalProps.exibeModal;
    // }

    public filtrar(): void {
        if (!this.validarCamposObrigatorios()) return;
        this.tratarCampos();

        const filtrosCampos: string[] = Object.keys(this.filtros);
        const filtrosValores: any[] = Object.values(this.filtros);

        let queryParams: string[] = [];

        filtrosCampos.forEach((campo, index) => {
            const valor = filtrosValores[index];
            queryParams.push(`${campo}=${valor}`);
        });

        const filtros = `?${queryParams.join('&')}`;

        // monta queryString (você já tem isso)
        // const filtros = /* ?campo=valor&etc */;

        // Modo paginado:
        const event: LazyLoadEvent = {
            first: 0,
            rows: this.tabelaProps.rows,
            sortField: this.tabelaProps.sortField,
            sortOrder: this.tabelaProps.sortOrder,
            globalFilter: filtros.substring(1) // tira o "?" para ser só "campo=valor..."
        };

        this.retornaDadosPaginados(this.tabelaProps, event);

        // se ainda quiser o modo “tudo”: 
        // this.retornaTodosDados(this.tabelaProps, filtros);

        this.limparFormulario();
        this.modalProps.exibeModal = !this.modalProps.exibeModal;
    }

    public campoEstaVazio(item: IForms): boolean {
        const valor = this.cadastro[item.formModel];

        switch (item.tipoDado) {
            case 'dinamico':
                return !valor || valor.length === 0;

            case 'lista':
                return Array.isArray(valor) ? valor.length === 0 : !valor;

            case 'fileupload':
                return !valor || valor.length === 0;

            case 'numerico':
                return valor === null || valor === undefined || valor === 0;

            case 'data':
                return !valor;

            case 'logico':
                return valor === null || valor === undefined;

            case 'texto':
            case 'textarea': // Adicione esta linha
                return !valor?.toString().trim();

            default:
                return !valor?.toString().trim();
        }
    }

    protected validarCamposObrigatorios(): boolean {
        if (!this.formCadastro) return true;

        const camposInvalidos: string[] = [];

        for (const item of this.formCadastro) {
            if (item.obrigatorio && item.visivel !== false) {
                const valor = this.cadastro[item.formModel];
                let invalido = false;

                switch (item.tipoDado) {
                    case 'dinamico':
                        invalido = !valor || !Array.isArray(valor) || valor.length === 0 || valor.some(v => !v?.toString().trim());
                        break;

                    case 'lista':
                        invalido = Array.isArray(valor) ? valor.length === 0 : !valor;
                        break;

                    case 'fileupload':
                        invalido = !valor || !Array.isArray(valor) || valor.length === 0;
                        break;

                    case 'numerico':
                        // Permite zero como valor válido
                        invalido = valor === null || valor === undefined || isNaN(valor);
                        break;

                    case 'data':
                        // Valida tanto Date quanto string no formato dd/MM/yyyy
                        invalido = !valor || (
                            typeof valor === 'string'
                                ? !this.validarDataCustom('dd/MM/yyyy', valor)
                                : !(valor instanceof Date) || isNaN(valor.getTime())
                        );
                        break;

                    case 'logico':
                        // Considera false como válido
                        invalido = valor === null || valor === undefined;
                        break;

                    case 'radio':
                        invalido = valor === null || valor === undefined;
                        break;

                    case 'textoEstatico':
                        invalido = false;
                        break;

                    case 'texto':
                    case 'textarea':
                        invalido = !valor?.toString().trim();
                        break;

                    default:
                        invalido = !valor?.toString().trim();
                }

                if (invalido) {
                    camposInvalidos.push(item.descricao || `Campo ${item.formModel}`);
                }
            }
        }

        if (camposInvalidos.length > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Campos obrigatórios',
                detail: `Preencha os campos: ${camposInvalidos.join(', ')}`,
                life: 5000
            });
            return false;
        }

        return true;
    }

    private validarDataCustom(format: string, dateString: string): boolean {
        try {
            const [day, month, year] = dateString.split('/');
            const date = new Date(`${year}-${month}-${day}`);
            return !isNaN(date.getTime());
        } catch {
            return false;
        }
    }

    public todosCamposValidos(): boolean {
        if (!this.formCadastro) return false;

        return this.formCadastro.every((item) => {
            if (!item.obrigatorio || item.visivel === false) return true;

            const valor = this.cadastro[item.formModel];

            const validarData = (value: any) => {
                if (value instanceof Date) return !isNaN(value.getTime());
                if (typeof value === 'string') return this.validarDataCustom('dd/MM/yyyy', value);
                return false;
            };

            // Helper para validar números
            const validarNumero = (value: any) => {
                const num = typeof value === 'string' ? parseFloat(value) : value;
                return typeof num === 'number' && !isNaN(num);
            };

            switch (item.tipoDado) {
                case 'dinamico':
                    return Array.isArray(valor) &&
                        valor.length > 0 &&
                        valor.every(v => v?.toString().trim() !== '');

                case 'lista':
                    if (item.optInput?.selecaoMultipla) {
                        return Array.isArray(valor) && valor.length > 0;
                    }
                    return valor !== null && valor !== undefined;

                case 'fileupload':
                    return Array.isArray(valor) && valor.length > 0;

                case 'numerico':
                    return validarNumero(valor);

                case 'data':
                    return !!valor && validarData(valor);

                case 'logico':
                    return valor !== null && valor !== undefined;

                case 'radio':
                    return valor !== null && valor !== undefined;

                case 'texto':
                case 'textarea':
                    return typeof valor === 'string' ? valor.trim() !== '' : !!valor;

                case 'textoEstatico':
                    return true;

                default:
                    return !!valor;
            }
        });
    }

    public uploadedFiles: File[] = [];

    public onFileSelect(event: any): void {
        // Converte o FileList para um array real e armazena na variável
        this.uploadedFiles = Array.from(event.files);
    }

    public onUpload(event: UploadEvent): void {
        this.tratarCampos();

        // Garante que this.uploadedFiles seja um array real, mesmo que o evento já retorne um FileList
        if (!Array.isArray(this.uploadedFiles)) {
            this.uploadedFiles = Array.from(event.files);
        } else {
            // Opcional: se desejar adicionar novos arquivos aos já selecionados
            for (let file of event.files) {
                if (!this.uploadedFiles.includes(file)) {
                    this.uploadedFiles.push(file);
                }
            }
        }

        // Se houver ao menos um arquivo, constrói o FormData
        if (this.uploadedFiles.length > 0) {
            const formData = new FormData();
            // Se desejar enviar todos os arquivos juntos, itere sobre o array:
            this.uploadedFiles.forEach((file) => {
                formData.append('file', file, file.name);
            });

            // Chama o método que envia o arquivo para o back-end.
            // Observe que estamos passando o formData e, por exemplo, a propriedade 'tabelaProps'
            // que contém a rota/identificador do recurso.
            this.requisicaoUploadArquivo(
                this.modalProps,
                this.cadastro,
                this.tabelaProps,
                formData
            );
        }

        // Exibe uma mensagem informando que o upload foi iniciado
        this.messageService.add({
            severity: 'info',
            summary: 'Upload iniciado',
            detail: 'Enviando arquivo(s) para o servidor...',
        });
    }

    protected adicionarCampo(campo: string): void {
        if (!this.cadastro[campo]) {
            this.cadastro[campo] = [];
        }
        this.cadastro[campo].push('');
    }

    protected removerCampo(campo: string, index: number): void {
        if (this.cadastro[campo].length > 1) {
            this.cadastro[campo].splice(index, 1);
        }
    }

    public async onFileDadosSelect(event: any, formModel: string, item: any) {
        try {
            // Converter para array com fallback
            const rawFiles = [...(event?.files || [])];

            // Criar Files válidos
            const files = rawFiles.map((f) => {
                return new File([f], f.name || `arquivo-${Date.now()}`, {
                    type: f.type || 'application/octet-stream',
                    lastModified: f.lastModified || Date.now(),
                });
            });

            if (!files.length) return;

            // Processar arquivos
            for (const file of files) {
                if (!this.validarArquivo(file, item)) continue;

                const base64 = await this.convertFileToBase64(file);
                this.cadastro[formModel].push({
                    name: file.name,
                    type: file.type,
                    objectURL: URL.createObjectURL(file),
                    base64: base64.includes(',')
                        ? base64.split(',')[1]
                        : base64,
                    mimeType: file.type,
                    size: file.size,
                });
            }
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Falha no upload',
                detail: 'Erro ao processar arquivos',
                life: 5000,
            });
        }
    }

    private async convertFileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result as string);
            };

            reader.onerror = () => {
                reject(new Error(`Erro ao ler ${file.name}`));
            };

            reader.readAsDataURL(file);
        });
    }

    private validarArquivo(file: File, item?: any): boolean {
        // Verifica se é uma instância válida de File
        if (!(file instanceof File)) {
            return false;
        }

        // Verifica propriedades obrigatórias
        if (!file.name || !file.type) {
            return false;
        }

        // Tipos MIME suportados
        const tiposPermitidos = new Set(
            item?.optInput?.fileUploadHint?.tiposPermitidos?.mimeTypes || [
                'application/pdf',
                'image/jpeg',
                'image/pjpeg',
                'image/png',
                'image/x-png',
            ]
        );

        // Extensões permitidas (validação extra)
        const extensoesPermitidas = new Set(
            item?.optInput?.fileUploadHint?.tiposPermitidos?.extensoes || [
                '.pdf',
                '.jpg',
                '.jpeg',
                '.png',
            ]
        );

        // Tamanho máximo (10MB) - Ajuste depois para poder ter controle do tamanho diretamente nas telas!!
        const tamanhoMaximo = 10 * 1024 * 1024;

        // Validação 1: Tamanho
        if (file.size > tamanhoMaximo) {
            this.messageService.add({
                severity: 'error',
                summary: 'Arquivo muito grande',
                detail: `${file.name}: Tamanho máximo permitido é 10MB`,
                life: 5000,
            });
            return false;
        }

        // Validação 2: Tipo MIME
        if (!tiposPermitidos.has(file.type)) {
            const formatos = Array.from(extensoesPermitidas)
                .join(', ')
                .toUpperCase();
            this.messageService.add({
                severity: 'error',
                summary: 'Tipo de arquivo inválido',
                detail: `${file.name}: ${item.optInput.fileUploadHint.instrucoes}`,
                life: 5000,
            });
            return false;
        }

        // Validação 3: Extensão (case-insensitive)
        const extensao = file.name
            .slice(((file.name.lastIndexOf('.') - 1) >>> 0) + 2)
            .toLowerCase();
        if (!extensoesPermitidas.has(`.${extensao}`)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Extensão inválida',
                detail: `${file.name}: Extensão .${extensao} não é permitida`,
                life: 5000,
            });
            return false;
        }

        return true;
    }

    public getAcceptedTypes(item: any): string {
        return (
            item?.optInput?.fileUploadHint?.tiposPermitidos?.mimeTypes?.join(
                ','
            ) || '*'
        );
    }

    // Converte bytes para formato legível (ex: 2.5 MB)
    public formatFileSize(bytes: number | undefined): string {
        if (!bytes || typeof bytes !== 'number' || bytes <= 0) return '0 Bytes';

        const unidades = ['Bytes', 'KB', 'MB', 'GB'];
        const base = 1024;
        const indice = Math.floor(Math.log(bytes) / Math.log(base));

        // Evitar índices inválidos para arrays grandes
        const indiceAjustado = Math.min(indice, unidades.length - 1);

        return `${(bytes / Math.pow(base, indiceAjustado)).toFixed(2)} ${unidades[indiceAjustado]
            }`;
    }

    // Fallback para imagens quebradas
    public handleImageError(event: Event) {
        const imgElement = event.target as HTMLImageElement;
        imgElement.style.display = 'none';

        // Opcional: Mostrar ícone padrão
        const parent = imgElement.parentElement;
        if (parent) {
            parent.insertAdjacentHTML(
                'afterbegin',
                '<i class="pi pi-image p-mr-2"></i>'
            );
        }
    }

    public onFileDadosRemove(formModel: string) {
        this.cadastro[formModel] = [];
    }

    public removeSingleFile(formModel: string, index: number) {
        this.cadastro[formModel] = this.cadastro[formModel].filter(
            (_, i) => i !== index
        );
    }

    public isImage(file: any): boolean {
        return (
            (file.type?.startsWith('image/') ||
                file.base64?.startsWith('data:image/')) &&
            (file.objectURL || file.base64)
        );
    }

    public isPDF(file: any): boolean {
        return (
            file.type === 'application/pdf' ||
            file.base64?.startsWith('data:application/pdf')
        );
    }

    public getImageSource(file: any): string {
        // Prioriza objectURL, fallback para base64
        return file.objectURL || file.base64;
    }

    /**
     * Funcionalidade de impressao de certificado (herdada do projeto de
     * referencia) nao e usada no dominio de gestao academica - nenhuma das
     * telas define gerarDadosCertificado(), entao este metodo nunca e
     * efetivamente acionado. Mantido apenas para nao quebrar o contrato da
     * classe base.
     */
    public imprimir(): void {
        if (this.gerarDadosCertificado) {
            this.gerarDadosCertificado().subscribe({
                next: () => {
                    console.warn('Impressao de certificado nao implementada para este componente.');
                },
                error: (erro) => {
                    console.error('Erro ao gerar dados para impressão:', erro);
                },
            });
        }
    }

    // Altere o retorno para Observable
    protected gerarDadosCertificado?(): Observable<any> {
        return of(null); // Implementação padrão vazia
    }

    // Adicione este método para converter a string de estilo
    public parseStyle(styleString: string): any {
        const styleObj: any = {};
        if (styleString) {
            styleString.split(';').forEach(rule => {
                const [key, value] = rule.split(':');
                if (key && value) {
                    const cssKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    styleObj[cssKey] = value.trim();
                }
            });
        }
        return styleObj;
    }

    protected abstract tratarCampos(): void;
    protected abstract constroiListas(): void;
    protected abstract constroiFormulario(): void;
    protected abstract limparFormulario(): void;
}

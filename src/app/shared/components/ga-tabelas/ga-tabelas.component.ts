import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IBtnAcoesCustom, IColunas } from '../../../model/components/ga-tabelas';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'ga-tabelas',
  templateUrl: './ga-tabelas.component.html',
  styleUrls: ['./ga-tabelas.component.scss']
})
export class GaTabelasComponent implements OnInit {
  @Input() dados!: any[];
  @Input() colunas!: IColunas[];
  @Input() colunasCustom!: boolean;
  @Input() acoes!: boolean;
  @Input() acoesCustom!: boolean;
  @Input() btnAcoesCustom!: IBtnAcoesCustom[];
  @Input() loading!: boolean;
  @Input() selecionados!: any[];
  @Output() emitSelecionados: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() emitRemocao: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitModalVisualizacao: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitModalAlteracao: EventEmitter<any> = new EventEmitter<any>();

  constructor(private message: MessageService, private confirmation: ConfirmationService) { }

  ngOnInit() {}

  public capturaRegistros(selecoes: any): void {
    this.selecionados = selecoes;
    this.emitSelecionados.emit(this.selecionados);
  }

  public removeRegistro(rowData: any): void {
    this.confirmation.confirm({
      header: 'Confirmar',
      message: `Deseja remover o registros selecionado?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.message.add({ severity: 'success', summary: 'Sucesso', detail: 'Registro removido com sucesso!', life: 3000 });
        this.emitRemocao.emit(true);
      }
    });
  }

  public chamaModalVisualizacao(rowData: any): void {
    this.emitModalVisualizacao.emit(rowData);
  }

  public chamaModalAlteracao(rowData: any): void {
    this.emitModalAlteracao.emit(rowData);
  }

}

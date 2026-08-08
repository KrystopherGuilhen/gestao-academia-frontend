import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const TXT_EXTENSION = '.txt';

@Injectable({
    providedIn: 'root',
})
export class ExportersService {

    /**
     * Converte valores booleanos para "Sim"/"Não" nas exportacoes (Excel,
     * PDF, TXT) — sem isso, o valor bruto aparece como "true"/"false" (ou
     * "VERDADEIRO"/"FALSO" no Excel em pt-BR), que nao e amigavel para
     * quem abre o arquivo exportado.
     */
    private formatarValor(value: any): any {
        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }
        return value;
    }

    public exportToExcel(data: any[], fileName: string, columns: any[]): void {
        const tableData = data.map((row) => {
            let newRow = {};
            columns.forEach((col) => {
                if (col.field !== 'edit') {
                    let value = row[col.field];
                    if (Array.isArray(value)) {
                        newRow[col.header] = value.length; // Contabiliza a quantidade de itens
                    } else {
                        newRow[col.header] = this.formatarValor(value);
                    }
                }
            });
            return newRow;
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(tableData);

        const columnWidths = this.calculateColumnWidths(tableData, columns);

        this.applyHeaderStyles(worksheet, columns);

        worksheet['!cols'] = columnWidths;

        const workbook: XLSX.WorkBook = {
            Sheets: { data: worksheet },
            SheetNames: ['data'],
        };

        // Alterar 'xls' para 'xlsx'
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        this.saveAsExcelFile(excelBuffer, fileName);
    }

    private calculateColumnWidths(data: any[], columns: any[]): XLSX.ColInfo[] {
        return columns.map((col) => {
            const minWidth = 10;
            const maxWidth = 50;

            const width = Math.max(
                ...data.map((row) => {
                    const cellValue = row[col.field];

                    // Verifica se o valor da célula é uma lista (array)
                    if (Array.isArray(cellValue)) {
                        // Converte a lista para uma string, unindo os itens com vírgula
                        return cellValue.join(', ').length;
                    }

                    // Verifica se o valor da célula é um objeto
                    if (typeof cellValue === 'object' && cellValue !== null) {
                        // Converte o objeto em uma string legível (ex.: chave: valor)
                        return JSON.stringify(cellValue).length;
                    }

                    // Caso seja um valor simples (string, número, etc.)
                    return cellValue ? cellValue.toString().length : 0;
                }),
                col.header.length
            );

            return { wch: Math.min(maxWidth, Math.max(minWidth, width)) };
        });
    }

    private applyHeaderStyles(worksheet: XLSX.WorkSheet, columns: any[]): void {
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '000000' } },
            alignment: { horizontal: 'center' },
        };

        columns.forEach((col, index) => {
            const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = { t: 's', v: col.header };
            }

            worksheet[cellAddress].s = headerStyle;
        });

        worksheet['!rows'] = [{ hpx: 20 }];
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        saveAs(data, fileName + EXCEL_EXTENSION);
    }

    public exportToPdf(data: any[], fileName: string, columns: any[]): void {
        const doc = new jsPDF();

        // Processar colunas
        const filteredColumns = columns.filter(col => col.field !== 'edit');

        // Preparar dados
        const headers = filteredColumns.map(col => col.header);
        const body = data.map(row =>
            filteredColumns.map(col => this.formatarValor(row[col.field]))
        );

        // Gerar tabela
        autoTable(doc, {
            head: [headers],
            body: body,
            theme: 'grid',
            styles: {
                fontSize: 10,
                halign: 'center',
                cellPadding: 2
            },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                halign: 'center'
            }
        });

        doc.save(`${fileName}.pdf`);
    }

    public exportToTxt(data: any[], fileName: string, columns: any[]): void {
        let txtContent =
            columns
                .filter((col) => col.field !== 'edit')
                .map((col) => col.header)
                .join(',') + '\n';

        data.forEach((row) => {
            let line = columns
                .map((col) => {
                    if (col.field === 'edit') return '';
                    let value = row[col.field];
                    return Array.isArray(value) ? value.join(';') : this.formatarValor(value); // Se for array, separa os itens com ponto e vírgula
                })
                .join(',');
            txtContent += line + '\n';
        });

        const blob = new Blob([txtContent], {
            type: 'text/plain;charset=utf-8',
        });
        saveAs(blob, fileName + TXT_EXTENSION);
    }
}

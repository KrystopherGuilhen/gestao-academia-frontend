export class FuncoesUtils {

    public static conversaoMesAtual(): Date {
        return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }

    public static conversaoAnoAtual(): number {
        return Number(new Date().getFullYear());
    }

    public static converteMesParaDate(mes: string): Date {
        return new Date(new Date().getFullYear(), Number(mes) - 1, 1);
    }

    /** Converte um Date (do p-calendar) para string ISO "yyyy-MM-dd", formato aceito pelo backend (LocalDate). */
    public static converteDateParaIso(data: Date | string | null | undefined): string | null {
        if (!data) return null;
        if (typeof data === 'string') return data;
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }

    /** Converte uma string ISO ("yyyy-MM-dd" ou com horário) vinda do backend para Date, para o p-calendar exibir. */
    public static converteIsoParaDate(iso: string | Date | null | undefined): Date | null {
        if (!iso) return null;
        if (iso instanceof Date) return iso;
        const [anoMesDia] = iso.split('T');
        const [ano, mes, dia] = anoMesDia.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
    }

}

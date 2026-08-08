import { Component } from '@angular/core';
import { ITurma } from 'src/app/model/turma';

@Component({
    selector: 'ga-cadastro-turma',
    templateUrl: './cadastro-turma.component.html',
})
export class CadastroTurmaComponent {
    cadastro: ITurma = this.formularioVazio();

    public recebeModalCadastro(modalProps: any): void {
        modalProps.modalCadastro = true;
        modalProps.exibeModal = !modalProps.exibeModal;
    }

    public recebeDadosCadastro(cadastro: ITurma): void {
        this.cadastro = { ...cadastro };
    }

    public recebeCancelarCadastro(): void {
        this.cadastro = this.formularioVazio();
    }

    public recebeConfirmacaoSalvar(formulario: { submitted: boolean; cadastro: ITurma }): void {
        if (formulario.submitted) {
            this.cadastro = this.formularioVazio();
        }
    }

    private formularioVazio(): ITurma {
        return {
            codigo: '',
            disciplinaId: null,
            periodo: '',
            vagasTotais: null,
            dataInicio: null,
            dataFim: null,
            status: 'ABERTA',
        };
    }
}

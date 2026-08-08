import { Component } from '@angular/core';
import { IDisciplina } from 'src/app/model/disciplina';

@Component({
    selector: 'ga-cadastro-disciplina',
    templateUrl: './cadastro-disciplina.component.html',
})
export class CadastroDisciplinaComponent {
    cadastro: IDisciplina = this.formularioVazio();

    public recebeModalCadastro(modalProps: any): void {
        modalProps.modalCadastro = true;
        modalProps.exibeModal = !modalProps.exibeModal;
    }

    public recebeDadosCadastro(cadastro: IDisciplina): void {
        this.cadastro = { ...cadastro };
    }

    public recebeCancelarCadastro(): void {
        this.cadastro = this.formularioVazio();
    }

    public recebeConfirmacaoSalvar(formulario: { submitted: boolean; cadastro: IDisciplina }): void {
        if (formulario.submitted) {
            this.cadastro = this.formularioVazio();
        }
    }

    private formularioVazio(): IDisciplina {
        return { nome: '', codigo: '', cargaHoraria: null, cursoId: null, ativo: true };
    }
}

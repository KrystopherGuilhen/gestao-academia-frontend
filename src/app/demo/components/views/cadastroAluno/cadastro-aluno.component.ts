import { Component } from '@angular/core';
import { IAluno } from 'src/app/model/aluno';

@Component({
    selector: 'ga-cadastro-aluno',
    templateUrl: './cadastro-aluno.component.html',
})
export class CadastroAlunoComponent {
    cadastro: IAluno = this.formularioVazio();

    public recebeModalCadastro(modalProps: any): void {
        modalProps.modalCadastro = true;
        modalProps.exibeModal = !modalProps.exibeModal;
    }

    public recebeDadosCadastro(cadastro: IAluno): void {
        this.cadastro = { ...cadastro };
    }

    public recebeCancelarCadastro(): void {
        this.cadastro = this.formularioVazio();
    }

    public recebeConfirmacaoSalvar(formulario: { submitted: boolean; cadastro: IAluno }): void {
        if (formulario.submitted) {
            this.cadastro = this.formularioVazio();
        }
    }

    private formularioVazio(): IAluno {
        return { nome: '', email: '', cpf: '', dataNascimento: null, ativo: true };
    }
}

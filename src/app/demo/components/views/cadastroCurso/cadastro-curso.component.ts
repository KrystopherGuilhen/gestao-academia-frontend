import { Component } from '@angular/core';
import { ICurso } from 'src/app/model/curso';

@Component({
    selector: 'ga-cadastro-curso',
    templateUrl: './cadastro-curso.component.html',
})
export class CadastroCursoComponent {
    cadastro: ICurso = this.formularioVazio();

    public recebeModalCadastro(modalProps: any): void {
        modalProps.modalCadastro = true;
        modalProps.exibeModal = !modalProps.exibeModal;
    }

    public recebeDadosCadastro(cadastro: ICurso): void {
        this.cadastro = { ...cadastro };
    }

    public recebeCancelarCadastro(): void {
        this.cadastro = this.formularioVazio();
    }

    public recebeConfirmacaoSalvar(formulario: { submitted: boolean; cadastro: ICurso }): void {
        if (formulario.submitted) {
            this.cadastro = this.formularioVazio();
        }
    }

    private formularioVazio(): ICurso {
        return { nome: '', codigo: '', cargaHorariaTotal: null, ativo: true };
    }
}

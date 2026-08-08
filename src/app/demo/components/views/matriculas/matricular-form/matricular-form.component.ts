import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ControleService } from 'src/app/shared/services/controle.service';

interface IOpcaoAluno {
    label: string;
    value: number;
}

interface IOpcaoTurma {
    label: string;
    value: number;
    vagasDisponiveis: number;
}

/**
 * Formulario dedicado para o fluxo de matricula. Foi feito como um
 * componente simples e independente (sem o form builder generico
 * usado nas telas de cadastro) porque a matricula tem apenas dois
 * campos de entrada (aluno e turma) - usar o motor completo de
 * formularios dinamicos aqui seria complexidade desnecessaria para
 * o que o desafio pede.
 */
@Component({
    selector: 'ga-matricular-form',
    templateUrl: './matricular-form.component.html',
})
export class MatricularFormComponent implements OnInit {
    alunos: IOpcaoAluno[] = [];
    turmas: IOpcaoTurma[] = [];

    alunoSelecionado: number | null = null;
    turmaSelecionada: number | null = null;
    salvando = false;

    @Output() matriculaCriada = new EventEmitter<void>();

    constructor(
        private requestService: ControleService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) { }

    ngOnInit(): void {
        this.carregarAlunos();
        this.carregarTurmas();
    }

    private carregarAlunos(): void {
        this.requestService.getDados('api/alunos/todos').subscribe({
            next: (res) => {
                this.alunos = (res.dados ?? [])
                    .filter((a: any) => a.ativo)
                    .map((a: any) => ({ label: `${a.nome} (${a.cpf})`, value: a.id }));
            },
        });
    }

    private carregarTurmas(): void {
        this.requestService.getDados('api/turmas/todos').subscribe({
            next: (res) => {
                this.turmas = (res.dados ?? [])
                    .filter((t: any) => t.status === 'ABERTA')
                    .map((t: any) => ({
                        label: `${t.codigo} - ${t.nomeDisciplina} (${t.vagasOcupadas}/${t.vagasTotais} vagas)`,
                        value: t.id,
                        vagasDisponiveis: t.vagasTotais - t.vagasOcupadas,
                    }));
            },
        });
    }

    public matricular(): void {
        if (!this.alunoSelecionado || !this.turmaSelecionada) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Selecione o aluno e a turma para matricular.',
                life: 4000,
            });
            return;
        }

        this.confirmationService.confirm({
            message: 'Confirma a matrícula deste aluno nesta turma? A matrícula será criada com status PENDENTE.',
            header: 'Matricular aluno',
            icon: 'pi pi-user-plus',
            accept: () => {
                this.salvando = true;
                this.requestService.postDados('api/matriculas', {
                    alunoId: this.alunoSelecionado,
                    turmaId: this.turmaSelecionada,
                }).subscribe({
                    next: (res: any) => {
                        this.salvando = false;
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: res.mensagem, life: 3000 });
                        this.alunoSelecionado = null;
                        this.turmaSelecionada = null;
                        this.carregarTurmas();
                        this.matriculaCriada.emit();
                    },
                    error: (erro) => {
                        this.salvando = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Não foi possível matricular',
                            detail: erro.error?.mensagem || 'Erro ao criar a matrícula',
                            life: 5000,
                        });
                    },
                });
            },
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ControleService } from 'src/app/shared/services/controle.service';

interface ResumoCard {
    label: string;
    valor: number;
    icone: string;
    cor: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    carregando = true;
    cards: ResumoCard[] = [];
    ultimasTurmas: any[] = [];

    constructor(private controleService: ControleService) { }

    ngOnInit(): void {
        forkJoin({
            alunos: this.controleService.getDados('api/alunos/todos'),
            cursos: this.controleService.getDados('api/cursos/todos'),
            disciplinas: this.controleService.getDados('api/disciplinas/todos'),
            turmas: this.controleService.getDados('api/turmas/todos'),
        }).subscribe({
            next: ({ alunos, cursos, disciplinas, turmas }) => {
                const turmasLista = turmas.dados ?? [];

                this.cards = [
                    { label: 'Alunos cadastrados', valor: (alunos.dados ?? []).length, icone: 'pi pi-users', cor: 'bg-blue-100 text-blue-700' },
                    { label: 'Cursos', valor: (cursos.dados ?? []).length, icone: 'pi pi-book', cor: 'bg-orange-100 text-orange-700' },
                    { label: 'Disciplinas', valor: (disciplinas.dados ?? []).length, icone: 'pi pi-list', cor: 'bg-purple-100 text-purple-700' },
                    { label: 'Turmas abertas', valor: turmasLista.filter((t: any) => t.status === 'ABERTA').length, icone: 'pi pi-calendar', cor: 'bg-green-100 text-green-700' },
                ];

                this.ultimasTurmas = turmasLista.slice(0, 6);
                this.carregando = false;
            },
            error: () => {
                this.carregando = false;
            }
        });
    }
}

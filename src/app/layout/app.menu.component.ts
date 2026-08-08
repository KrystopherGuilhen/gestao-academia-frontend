import { Component, OnInit } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

/**
 * Menu lateral da aplicacao. Diferente do projeto de referencia, aqui nao
 * ha um sistema de permissoes granulares por perfil: qualquer usuario
 * autenticado (protegido pelo AuthGuard/JWT) ve todas as telas de cadastro.
 * Essa foi uma simplificacao deliberada, documentada no README, para manter
 * o escopo aderente ao que o desafio Pleno pede.
 */
@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/'],
                    },
                ],
            },
            {
                label: 'Cadastros',
                items: [
                    { label: 'Alunos', icon: 'pi pi-fw pi-users', routerLink: ['/cadastro/alunos'] },
                    { label: 'Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/cadastro/cursos'] },
                    { label: 'Disciplinas', icon: 'pi pi-fw pi-list', routerLink: ['/cadastro/disciplinas'] },
                    { label: 'Turmas', icon: 'pi pi-fw pi-calendar', routerLink: ['/cadastro/turmas'] },
                ],
            },
            {
                label: 'Matriculas',
                items: [
                    { label: 'Matricular aluno', icon: 'pi pi-fw pi-user-plus', routerLink: ['/cadastro/matriculas'] },
                ],
            },
        ];
    }
}

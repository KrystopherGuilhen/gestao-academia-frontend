import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MessageService } from 'primeng/api';
import { ControleService } from 'src/app/shared/services/controle.service';

interface LoginResponse {
    token: string;
    username: string;
    nome: string;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform: scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `],
    providers: [MessageService]
})
export class LoginComponent implements OnInit {
    username!: string;
    password!: string;
    carregando: boolean = false;
    senhaIncorreta: boolean = false;
    erroSistema = false;
    erroMensagem = '';

    constructor(
        private router: Router,
        public layoutService: LayoutService,
        private controleService: ControleService,
        private messageService: MessageService,
    ) { }

    ngOnInit() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }

    login() {
        if (!this.username || !this.password) {
            return;
        }

        this.carregando = true;
        this.erroSistema = false;
        this.senhaIncorreta = false;

        this.controleService.postDados('api/auth/login', {
            username: this.username,
            password: this.password
        }).subscribe({
            next: (resposta: any) => {
                this.processarLoginSucesso(resposta.dados as LoginResponse);
            },
            error: (erro) => {
                this.processarErroLogin(erro);
            }
        });
    }

    private processarLoginSucesso(dados: LoginResponse): void {
        if (dados?.token) {
            localStorage.setItem('token', dados.token);
            localStorage.setItem('usuario', JSON.stringify({ username: dados.username, nome: dados.nome }));
            this.router.navigate(['/']);
        } else {
            this.senhaIncorreta = true;
        }
        this.carregando = false;
    }

    private processarErroLogin(erro: any): void {
        this.carregando = false;

        if (erro.status === 0) {
            this.erroSistema = true;
            this.erroMensagem = 'Sistema não está disponível no momento';
        } else if (erro.status === 401) {
            this.senhaIncorreta = true;
        } else {
            this.erroSistema = true;
            this.erroMensagem = erro.error?.mensagem || 'Erro na autenticação';
        }
    }

    onPasswordInput() {
        this.senhaIncorreta = false;
    }
}

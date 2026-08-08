// app.topbar.component.ts
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnInit {
    items!: MenuItem[];
    userName: string = '';

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private router: Router
    ) {}

    ngOnInit() {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            this.userName = usuario?.nome ?? usuario?.username ?? '';
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.router.navigate(['/auth/login']);
    }
}

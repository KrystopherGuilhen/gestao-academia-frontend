import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import localePt from '@angular/common/locales/pt';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { CadastroCursoCadastroComponent } from './cadastro-curso-cadastro/cadastro-curso-cadastro.component';
import { CadastroCursoViewComponent } from './cadastro-curso-view/cadastro-curso-view.component';
import { CadastroCursoComponent } from './cadastro-curso.component';
import { CadastroCursoRoutingModule } from './cadastro-curso-routing.module';

registerLocaleData(localePt);

@NgModule({
    imports: [
        SharedComponentsModule,
        CadastroCursoRoutingModule
    ],
    declarations: [
        CadastroCursoComponent,
        CadastroCursoViewComponent,
        CadastroCursoCadastroComponent
    ],
    providers: [
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'pt' }
    ]
})
export class CadastroCursoModule { }

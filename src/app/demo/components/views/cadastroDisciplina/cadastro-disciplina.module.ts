import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import localePt from '@angular/common/locales/pt';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { CadastroDisciplinaCadastroComponent } from './cadastro-disciplina-cadastro/cadastro-disciplina-cadastro.component';
import { CadastroDisciplinaViewComponent } from './cadastro-disciplina-view/cadastro-disciplina-view.component';
import { CadastroDisciplinaComponent } from './cadastro-disciplina.component';
import { CadastroDisciplinaRoutingModule } from './cadastro-disciplina-routing.module';

registerLocaleData(localePt);

@NgModule({
    imports: [
        SharedComponentsModule,
        CadastroDisciplinaRoutingModule
    ],
    declarations: [
        CadastroDisciplinaComponent,
        CadastroDisciplinaViewComponent,
        CadastroDisciplinaCadastroComponent
    ],
    providers: [
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'pt' }
    ]
})
export class CadastroDisciplinaModule { }

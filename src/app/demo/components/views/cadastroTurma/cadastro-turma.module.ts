import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import localePt from '@angular/common/locales/pt';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { CadastroTurmaCadastroComponent } from './cadastro-turma-cadastro/cadastro-turma-cadastro.component';
import { CadastroTurmaViewComponent } from './cadastro-turma-view/cadastro-turma-view.component';
import { CadastroTurmaComponent } from './cadastro-turma.component';
import { CadastroTurmaRoutingModule } from './cadastro-turma-routing.module';

registerLocaleData(localePt);

@NgModule({
    imports: [
        SharedComponentsModule,
        CadastroTurmaRoutingModule
    ],
    declarations: [
        CadastroTurmaComponent,
        CadastroTurmaViewComponent,
        CadastroTurmaCadastroComponent
    ],
    providers: [
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'pt' }
    ]
})
export class CadastroTurmaModule { }

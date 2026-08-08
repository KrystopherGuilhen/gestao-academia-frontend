import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import localePt from '@angular/common/locales/pt';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { CadastroAlunoCadastroComponent } from './cadastro-aluno-cadastro/cadastro-aluno-cadastro.component';
import { CadastroAlunoViewComponent } from './cadastro-aluno-view/cadastro-aluno-view.component';
import { CadastroAlunoComponent } from './cadastro-aluno.component';
import { CadastroAlunoRoutingModule } from './cadastro-aluno-routing.module';

registerLocaleData(localePt);

@NgModule({
    imports: [
        SharedComponentsModule,
        CadastroAlunoRoutingModule
    ],
    declarations: [
        CadastroAlunoComponent,
        CadastroAlunoViewComponent,
        CadastroAlunoCadastroComponent
    ],
    providers: [
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'pt' }
    ]
})
export class CadastroAlunoModule { }

import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import localePt from '@angular/common/locales/pt';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { MatriculasViewComponent } from './matriculas-view/matriculas-view.component';
import { MatricularFormComponent } from './matricular-form/matricular-form.component';
import { MatriculasComponent } from './matriculas.component';
import { MatriculasRoutingModule } from './matriculas-routing.module';

registerLocaleData(localePt);

@NgModule({
    imports: [
        SharedComponentsModule,
        DropdownModule,
        FormsModule,
        MatriculasRoutingModule
    ],
    declarations: [
        MatriculasComponent,
        MatriculasViewComponent,
        MatricularFormComponent
    ],
    providers: [
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'pt' }
    ]
})
export class MatriculasModule { }

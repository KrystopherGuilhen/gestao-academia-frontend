import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GaToolbarComponent } from './ga-toolbar/ga-toolbar.component';
import { GaModalComponent } from './ga-modal/ga-modal.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SplitButtonModule } from 'primeng/splitbutton';
import { GaTabelasComponent } from './ga-tabelas/ga-tabelas.component';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { ContextMenuModule } from 'primeng/contextmenu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { InputMaskModule } from 'primeng/inputmask';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/demo/components/auth/AuthInterceptor';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ToolbarModule,
        ButtonModule,
        TooltipModule,
        SplitButtonModule,
        TableModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        CalendarModule,
        CheckboxModule,
        RadioButtonModule,
        FileUploadModule,
        ContextMenuModule,
        OverlayPanelModule,
        MultiSelectModule,
        ListboxModule,
        BadgeModule,
        ConfirmDialogModule,
        ToastModule,
        NgxMaskDirective,
        NgxMaskPipe,
        InputMaskModule
    ],
    declarations: [
        GaToolbarComponent,
        GaTabelasComponent,
        GaModalComponent,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ToolbarModule,
        ButtonModule,
        TooltipModule,
        SplitButtonModule,
        TableModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        CalendarModule,
        CheckboxModule,
        RadioButtonModule,
        FileUploadModule,
        ContextMenuModule,
        OverlayPanelModule,
        MultiSelectModule,
        ListboxModule,
        BadgeModule,
        GaToolbarComponent,
        GaTabelasComponent,
        GaModalComponent,
        ConfirmDialogModule,
        ToastModule,
        NgxMaskDirective,
        NgxMaskPipe,
        InputMaskModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        MessageService,
        ConfirmationService,
        provideNgxMask({
            validation: true, // Valida o input conforme a máscara
            dropSpecialCharacters: true, // Remove caracteres especiais do model
        }),
    ],
})
export class SharedComponentsModule { }

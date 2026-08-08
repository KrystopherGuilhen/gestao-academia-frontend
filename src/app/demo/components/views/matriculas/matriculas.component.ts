import { Component, ViewChild } from '@angular/core';
import { MatriculasViewComponent } from './matriculas-view/matriculas-view.component';

@Component({
    selector: 'ga-matriculas',
    templateUrl: './matriculas.component.html',
})
export class MatriculasComponent {
    @ViewChild('view') tabelaView!: MatriculasViewComponent;

    public recarregarTabela(): void {
        this.tabelaView.recarregaDados();
    }
}

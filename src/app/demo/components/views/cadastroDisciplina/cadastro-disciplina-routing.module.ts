import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroDisciplinaComponent } from './cadastro-disciplina.component';

const routes: Routes = [
    { path: '', component: CadastroDisciplinaComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CadastroDisciplinaRoutingModule { }

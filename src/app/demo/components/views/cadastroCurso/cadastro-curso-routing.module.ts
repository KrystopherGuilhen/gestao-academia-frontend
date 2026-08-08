import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroCursoComponent } from './cadastro-curso.component';

const routes: Routes = [
    { path: '', component: CadastroCursoComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CadastroCursoRoutingModule { }

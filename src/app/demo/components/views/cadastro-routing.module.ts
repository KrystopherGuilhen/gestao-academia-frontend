import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'alunos',
                data: { breadcrumb: 'Alunos' },
                loadChildren: () =>
                    import('./cadastroAluno/cadastro-aluno.module').then(
                        (m) => m.CadastroAlunoModule
                    ),
            },
            {
                path: 'cursos',
                data: { breadcrumb: 'Cursos' },
                loadChildren: () =>
                    import('./cadastroCurso/cadastro-curso.module').then(
                        (m) => m.CadastroCursoModule
                    ),
            },
            {
                path: 'disciplinas',
                data: { breadcrumb: 'Disciplinas' },
                loadChildren: () =>
                    import('./cadastroDisciplina/cadastro-disciplina.module').then(
                        (m) => m.CadastroDisciplinaModule
                    ),
            },
            {
                path: 'turmas',
                data: { breadcrumb: 'Turmas' },
                loadChildren: () =>
                    import('./cadastroTurma/cadastro-turma.module').then(
                        (m) => m.CadastroTurmaModule
                    ),
            },
            {
                path: 'matriculas',
                data: { breadcrumb: 'Matrículas' },
                loadChildren: () =>
                    import('./matriculas/matriculas.module').then(
                        (m) => m.MatriculasModule
                    ),
            },
            { path: '**', redirectTo: '/notfound' },
        ]),
    ],
    exports: [RouterModule],
})
export class CadastroRoutingModule { }

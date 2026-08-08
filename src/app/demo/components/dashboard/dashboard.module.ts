import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DashboardComponent } from './dashboard.component';
import { DashboardsRoutingModule } from './dashboard-routing.module';

@NgModule({
    imports: [
        CommonModule,
        TableModule,
        DashboardsRoutingModule,
    ],
    declarations: [DashboardComponent]
})
export class DashboardModule { }

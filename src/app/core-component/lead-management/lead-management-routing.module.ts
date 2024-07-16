import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { LeadManagementComponent } from './lead-management.component';

// import { AuthGuard } from 'src/app/core/core.index';

const routes: Routes = [
  {
    path: '',
    component: LeadManagementComponent,
    children: [
      {
        path: 'create-lead',
        component: CreateLeadComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadManagementRoutingModule { }

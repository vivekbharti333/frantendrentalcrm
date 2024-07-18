import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadManagementComponent } from './lead-management.component';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { FollowupOneComponent } from './followup-list/followup-one/followup-one.component';
import { AuthGuard } from 'src/app/core/core.index';



const routes: Routes = [
  {
    path: '',
    component: LeadManagementComponent,
    children: [
      {
        path: 'create-lead',
        component: CreateLeadComponent,
      },
      {
        path: 'follow-up-one',
        component: FollowupOneComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadManagementRoutingModule { }

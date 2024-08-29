import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadManagementComponent } from './lead-management.component';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { FollowupOneComponent } from './followup-list/followup-one/followup-one.component';
import { AuthGuard } from 'src/app/core/core.index';
import { AllLeadComponent } from './lead-list/all-lead/all-lead.component';
import { EnquiryComponent } from './lead-list/enquiry/enquiry.component';
import { ReservedComponent } from './lead-list/reserved/reserved.component';
import { LostComponent } from './lead-list/lost/lost.component';



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
      {
        path: 'all-lead',
        component: AllLeadComponent,
      },
      {
        path: 'enquiry',
        component: EnquiryComponent,
      },
      {
        path: 'reserved',
        component: ReservedComponent,
      },
      {
        path: 'lost',
        component: LostComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadManagementRoutingModule { }

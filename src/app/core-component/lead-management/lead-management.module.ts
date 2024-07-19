import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
// import { CreateLeadComponent } from './create-lead.component';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { LeadManagementComponent } from './lead-management.component';
import { LeadManagementRoutingModule } from './lead-management-routing.module';
import { FollowupOneComponent } from './followup-list/followup-one/followup-one.component';
import { FollowupTwoComponent } from './followup-list/followup-two/followup-two.component';
import { FollowupThreeComponent } from './followup-list/followup-three/followup-three.component';


@NgModule({
  declarations: [
    LeadManagementComponent,
    CreateLeadComponent,
    FollowupOneComponent,
    FollowupTwoComponent,
    FollowupThreeComponent,
  ],
  imports: [
    LeadManagementRoutingModule,
    CommonModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule
  ]
})
export class LeadManagementModule { }

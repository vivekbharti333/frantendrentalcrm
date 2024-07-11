import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { sharedModule } from 'src/app/shared/shared.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { CreateLeadComponent } from './create-lead/create-lead/create-lead.component';
import { LeadManagementRoutingModule } from './lead-management-routing.module';


@NgModule({
  declarations: [
    CreateLeadComponent
  ],
  imports: [
    CommonModule,
    LeadManagementRoutingModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule
  ]
})
export class LeadManagementModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { BookingManagementComponent } from './booking-management.component';
import { PickupComponent } from './pickup/pickup.component';
import { DropComponent } from './drop/drop.component';
import { BookingManagementRoutingModule } from './booking-management-routing.module';




@NgModule({
  declarations: [
    BookingManagementComponent,
    PickupComponent,
    DropComponent
  ],
  imports: [
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule,
    BookingManagementRoutingModule
  ]
})
export class BookingManagementModule { }

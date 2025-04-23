import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingManagementComponent } from './booking-management.component'; 
import { DropComponent } from './drop/drop.component'; 
import { PickupComponent } from './pickup/pickup.component'; 


const routes: Routes = [
  {
    path: '',
    component: BookingManagementComponent,
    children: [
      {
        path: 'drop',
        component: DropComponent,
      },
      {
        path: 'pick-up',
        component: PickupComponent,
      },
      
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingManagementRoutingModule { }

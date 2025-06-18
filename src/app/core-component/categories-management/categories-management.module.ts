import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 
import { MultiSelectModule } from 'primeng/multiselect';
import { sharedModule } from 'src/app/shared/shared.module';
import { CategoriesManagementComponent } from './categories-management.component';
import { CategoriesComponent } from './categories/categories.component';
import { SubCategoriesComponent } from './sub-categories/sub-categories.component';
import { SuperCategoriesComponent } from './super-categories/super-categories.component';
import { CategoriesManagementRoutingModule } from './categories-management-routing.module';
import { CategoriesTypeComponent } from './categories-type/categories-type.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // for using native JS Date
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    CategoriesManagementComponent,
    CategoriesComponent,
    SubCategoriesComponent,
    SuperCategoriesComponent,
    CategoriesTypeComponent
  ],
  imports: [
    CategoriesManagementRoutingModule,
    CommonModule,
    sharedModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MultiSelectModule,
    MatDialogModule,
   NgxMaterialTimepickerModule,
   MatDatepickerModule,
   MatNativeDateModule,
   MatFormFieldModule,
   MatInputModule
  ]
})
export class CategoriesManagementModule { }

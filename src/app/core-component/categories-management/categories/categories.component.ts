import { Component, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CategoriesManagementService } from '../categories-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn } from '@angular/forms';

interface data {
  value: string;
  name: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  providers: [MessageService, ToastModule, NgxMaterialTimepickerModule],
})
export class CategoriesComponent {
  public routes = routes;
  public categoryTypeList: any[] = [];
  public superCategoryList: any[] = [];
  public editSuperCategoryList: any[] = [];
  public baseUrl = Constant.Site_Url;

  public addCategoryForm!: FormGroup;
  public editCategoryForm!: FormGroup;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables
  addCategoryDialog: any;
  editCategoryDialog: any;
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  public filteredPickLocationList: any[] = [];
  public filteredDropLocationList: any[] = [];

// subCategoryList: { value: string; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private categoriesManagementService: CategoriesManagementService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.createForms();
    this.getCategoryDetailsList();
    this.getCategoryType();
    this.getSuperCategory();
    this.getPickUpHub();
    this.getDropHub();
  }

  timeStepValidator(stepMinutes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const time = control.value;
    if (!time) return null;

    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    return totalMinutes % stepMinutes === 0 ? null : { stepMismatch: true };
  };
}
subCategoryList: data[] = [
    { value: 'Manual-HB', name: "Manual-HB" },
    { value: 'Automatic-HB', name: "Automatic-HB" },
    { value: 'Automatic-SD', name: "Automatic-SD" },
    { value: 'Manual-MSUV', name: "Manual-SD" },
    { value: 'Automatic-MSUV', name: "Automatic-MSUV" },
    { value: 'Manual-SUV', name: "Manual-SUV" },
    { value: 'Automatic-SUV', name: "Automatic-SUV" },

    { value: 'Non-Gear', name: "Non-Gear" },
    { value: 'Gear-STD', name: "Gear-STD" },
    { value: 'Gear PRM', name: "Gear-PRM" },

    { value: 'Activity', name: "Activity" },
  ]

  getsubCategoryList(requestFor: string) {
//   const type = requestFor?.trim().toUpperCase();
// alert("requestFor : "+requestFor+" type: "+type);
//   switch (type) {
//     case 'BIKE':
//       return this.car;
//     case 'CAR':
//       return this.car;
//     case 'CURISE':
//     case 'WATERSPORT':
//     case 'ADVENTURE':
//     case 'YACHT':
//     case 'SIGHTSEEING':
//       return this.car;
//     default:
//       return [];
//   }
}


  createForms() {
    this.addCategoryForm = this.fb.group({
      pickDropHub: '',
      activityLocation: '',
      categoryImage: '',
      categoryTypeId: '',
      categoryTypeName: '',
      superCategoryId: '',
      category: '',
      subCategory: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      pickupHub: '',
      dropHub: '',
      companyRate: '',
      companyRateForKids: '',
      vendorRate: '',
      vendorRateForKids: '',
      quantity: '',
      kidQuantity: '',
      infantQuantity: '',
      securityAmount: '',
      description: '',
    });

    this.editCategoryForm = this.fb.group({
      categoryImage: '',
      categoryTypeId: '',
      categoryTypeName: '',
      superCategoryId: '',
      category: '',
      subCategory: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      pickupHub: '',
      dropHub: '',
      companyRate: '',
      companyRateForKids: '',
      vendorRate: '',
      vendorRateForKids: '',
      quantity: '',
      kidQuantity: '',
      infantQuantity: '',
      securityAmount: '',
      description: '',
      createdAt: '',
      status: '',
    });
  }

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.superCategoryList = [];
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  public getSuperCategory() {
    this.categoriesManagementService.getSuperCategoryList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.editSuperCategoryList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.superCategoryList = JSON.parse(
            JSON.stringify(response.listPayload)
          );;
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }


  public getSuperCategoryByCateTypeId(rowData: any) {
     
    this.categoriesManagementService
      .getSuperCategoryListByCategoryTypeId(rowData.id)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));

            // this.subCategoryList = this.getsubCategoryList(rowData.categoryTypeName);
           
          }
        },
        error: (error: any) =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover',
          }),
      });
  }

  public getPickUpHub() {
    this.categoriesManagementService.getLocationByType('PICK').subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.pickLocationList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredPickLocationList = this.pickLocationList;
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  public getDropHub() {
    this.categoriesManagementService.getLocationByType('DROP').subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.dropLocationList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredDropLocationList = this.dropLocationList;
        }
      },
      error: (error: any) =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

  submitCategoryForm() {
    this.categoriesManagementService
      .addCategoryDetails(this.addCategoryForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // alert(response['payload']['respMesg']);
              //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              // this.user;
              // this.modalInstance.hide();
              this.addCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getCategoryDetailsList();
            } else {
              // alert(response['payload']['respMesg']);

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: () =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
          }),
      });
    // this.isLoading = false;
  }

  submitEditedCategoryForm() {
    this.categoriesManagementService.editCategoryDetails(this.editCategoryForm.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.editCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getCategoryDetailsList();
            } else {
              // alert(response['payload']['respMesg']);

              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'danger-background-popover',
              });
            }
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        },
        error: () =>
          this.messageService.add({
            summary: '500',
            detail: 'Server Error',
          }),
      });
    // this.isLoading = false;
  }

  changeStatus(rowdata: any) {
    this.categoriesManagementService.changeCategoryStatus(rowdata).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
            });
            this.getCategoryDetailsList();
          } else {
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'danger-background-popover',
            });
          }
        } else {
          this.messageService.add({
            summary: response['payload']['respCode'],
            detail: response['payload']['respMesg'],
            styleClass: 'danger-background-popover',
          });
        }
      },
      error: () =>
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
        }),
    });
  }

  openAddModal(templateRef: TemplateRef<any>) {
    (this.addCategoryDialog = this.dialog.open(templateRef)),
    {
      width: '50rem',
    };
  }

  openEditModal(templateRef: TemplateRef<any>, rowData: any) {

    const formatDate = (value: string | Date | null): string | null => {
      if (!value) return null;
      const date = new Date(value);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const filterCategoryType: any = this.categoryTypeList.filter((item) => {
      if (item?.categoryTypeName === rowData.categoryTypeName) {
        return item;
      }
    });
    this.editCategoryForm.patchValue({
      categoryTypeId: rowData['categoryTypeId'] ?? null,
      superCategoryId: rowData['superCategoryId'] ?? null,
      category: rowData['category'] ?? '',
      subCategory: rowData['subCategory'] ?? '',
      startDate: formatDate(rowData['startDate']),
      endDate: formatDate(rowData['endDate']),
      startTime: rowData['startTime'] ?? '',
      endTime: rowData['endTime'] ?? '',
      pickupHub: rowData['pickupHub'] ?? '',
      dropHub: rowData['dropHub'] ?? '',
      companyRate: rowData['companyRate'] ?? 0,
      companyRateForKids: rowData['companyRateForKids'] ?? 0,
      vendorRate: rowData['vendorRate'] ?? 0,
      vendorRateForKids: rowData['vendorRateForKids'] ?? 0,
      quantity: rowData['quantity'] ?? 0,
      kidQuantity: rowData['kidQuantity'] ?? 0,
      infantQuantity: rowData['infantQuantity'] ?? 0,
      securityAmount: rowData['securityAmount'] ?? 0,
      description: rowData['description'] ?? '',
      createdAt: rowData['createdAt'] ? new Date(rowData['createdAt']) : null,
      status: rowData['status'] ?? true
    });

    (this.editCategoryDialog = this.dialog.open(templateRef)),
    {
      width: '50rem',
    };
  }

  getCategoryDetailsList() {
    this.categoriesManagementService
      .getCategoryDetailsList()
      .subscribe((apiRes: any) => {
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.category) {
            this.getTableData({ skip: res.skip, limit: this.totalData });
            this.pageSize = res.pageSize;
          }
        });
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.categoriesManagementService
      .getCategoryDetailsList()
      .subscribe((apiRes: any) => {
        this.tableData = [];
        this.serialNumberArray = [];
        this.totalData = apiRes.totalNumber;
        apiRes.listPayload.map((res: any, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            this.tableData.push(res);
            this.serialNumberArray.push(serialNumber);
          }
        });
        this.dataSource = new MatTableDataSource<users>(this.tableData);
        const dataSize = this.tableData.length;
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: this.serialNumberArray,
        });
      });
  }

  public sortData(sort: Sort) {
    const data = this.tableData.slice();
    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.tableData = this.dataSource.filteredData;
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part

        // Set the base64 string to the userPicture field
        // this.addCategoryForm.categoryImage =
        //   'data:image/png;base64,' + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }
}

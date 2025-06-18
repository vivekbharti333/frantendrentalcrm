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

  // timeValue: data[] = [
  //   { value: '00:15', name: "00:15 O'clock" },
  //   { value: '00:30', name: "00:30 O'clock" },
  //   { value: '00:45', name: "00:45 O'clock" },
  //   { value: '01:00', name: "01:00 O'clock" },
  //   { value: '01:15', name: "01:15 O'clock" },
  //   { value: '01:30', name: "01:30 O'clock" },
  //   { value: '01:45', name: "01:45 O'clock" },
  //   { value: '02:00', name: "02:00 O'clock" },
  //   { value: '02:15', name: "02:15 O'clock" },
  //   { value: '02:30', name: "02:30 O'clock" },
  //   { value: '02:45', name: "02:45 O'clock" },
  //   { value: '03:00', name: "03:00 O'clock" },
  //   { value: '03:15', name: "03:15 O'clock" },
  //   { value: '03:30', name: "03:30 O'clock" },
  //   { value: '03:45', name: "03:45 O'clock" },
  //   { value: '04:00', name: "04:00 O'clock" },
  //   { value: '04:15', name: "04:15 O'clock" },
  //   { value: '04:30', name: "04:30 O'clock" },
  //   { value: '04:45', name: "04:45 O'clock" },
  //   { value: '05:00', name: "05:00 O'clock" },
  //   { value: '05:15', name: "05:15 O'clock" },
  //   { value: '05:30', name: "05:30 O'clock" },
  //   { value: '05:45', name: "05:45 O'clock" },
  //   { value: '06:00', name: "06:00 O'clock" },
  //   { value: '06:15', name: "06:15 O'clock" },
  //   { value: '06:30', name: "06:30 O'clock" },
  //   { value: '06:45', name: "06:45 O'clock" },
  //   { value: '07:00', name: "07:00 O'clock" },
  //   { value: '07:15', name: "07:15 O'clock" },
  //   { value: '07:30', name: "07:30 O'clock" },
  //   { value: '07:45', name: "07:45 O'clock" },
  //   { value: '08:00', name: "08:00 O'clock" },
  //   { value: '08:15', name: "08:15 O'clock" },
  //   { value: '08:30', name: "08:30 O'clock" },
  //   { value: '08:45', name: "08:45 O'clock" },
  //   { value: '09:00', name: "09:00 O'clock" },
  //   { value: '09:15', name: "09:15 O'clock" },
  //   { value: '09:30', name: "09:30 O'clock" },
  //   { value: '09:45', name: "09:45 O'clock" },
  //   { value: '10:00', name: "10:00 O'clock" },
  //   { value: '10:15', name: "10:15 O'clock" },
  //   { value: '10:30', name: "10:30 O'clock" },
  //   { value: '10:45', name: "10:45 O'clock" },
  //   { value: '11:00', name: "11:00 O'clock" },
  //   { value: '11:15', name: "11:15 O'clock" },
  //   { value: '11:30', name: "11:30 O'clock" },
  //   { value: '11:45', name: "11:45 O'clock" },
  //   { value: '12:00', name: "12:00 O'clock" },
  //   { value: '12:15', name: "12:15 O'clock" },
  //   { value: '12:30', name: "12:30 O'clock" },
  //   { value: '12:45', name: "12:45 O'clock" },
  //   { value: '13:00', name: "13:00 O'clock" },
  //   { value: '13:15', name: "13:15 O'clock" },
  //   { value: '13:30', name: "13:30 O'clock" },
  //   { value: '13:45', name: "13:45 O'clock" },
  //   { value: '14:00', name: "14:00 O'clock" },
  //   { value: '14:15', name: "14:15 O'clock" },
  //   { value: '14:30', name: "14:30 O'clock" },
  //   { value: '14:45', name: "14:45 O'clock" },
  //   { value: '15:00', name: "15:00 O'clock" },
  //   { value: '15:15', name: "15:15 O'clock" },
  //   { value: '15:30', name: "15:30 O'clock" },
  //   { value: '15:45', name: "15:45 O'clock" },
  //   { value: '16:00', name: "16:00 O'clock" },
  //   { value: '16:15', name: "16:15 O'clock" },
  //   { value: '16:30', name: "16:30 O'clock" },
  //   { value: '16:45', name: "16:45 O'clock" },
  //   { value: '17:00', name: "17:00 O'clock" },
  //   { value: '17:15', name: "17:15 O'clock" },
  //   { value: '17:30', name: "17:30 O'clock" },
  //   { value: '17:45', name: "17:45 O'clock" },
  //   { value: '18:00', name: "18:00 O'clock" },
  //   { value: '18:15', name: "18:15 O'clock" },
  //   { value: '18:30', name: "18:30 O'clock" },
  //   { value: '18:45', name: "18:45 O'clock" },
  //   { value: '19:00', name: "19:00 O'clock" },
  //   { value: '19:15', name: "19:15 O'clock" },
  //   { value: '19:30', name: "19:30 O'clock" },
  //   { value: '19:45', name: "19:45 O'clock" },
  //   { value: '20:00', name: "20:00 O'clock" },
  //   { value: '20:15', name: "20:15 O'clock" },
  //   { value: '20:30', name: "20:30 O'clock" },
  //   { value: '20:45', name: "20:45 O'clock" },
  //   { value: '21:00', name: "21:00 O'clock" },
  //   { value: '21:15', name: "21:15 O'clock" },
  //   { value: '21:30', name: "21:30 O'clock" },
  //   { value: '21:45', name: "21:45 O'clock" },
  //   { value: '22:00', name: "22:00 O'clock" },
  //   { value: '22:15', name: "22:15 O'clock" },
  //   { value: '22:30', name: "22:30 O'clock" },
  //   { value: '22:45', name: "22:45 O'clock" },
  //   { value: '23:00', name: "23:00 O'clock" },
  //   { value: '23:15', name: "23:15 O'clock" },
  //   { value: '23:30', name: "23:30 O'clock" },
  //   { value: '23:45', name: "23:45 O'clock" },
  //   { value: '24:00', name: "24:00 O'clock" },
  //   { value: '24:15', name: "24:15 O'clock" },
  //   { value: '24:30', name: "24:30 O'clock" },
  //   { value: '24:45', name: "24:45 O'clock" },
  // ];


  createForms() {
    this.addCategoryForm = this.fb.group({
      categoryImage: '',
      categoryTypeId: '',
      superCategoryId: '',
      category: '',
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
      childrenQuantity: '',
      infantQuantity: '',
      securityAmount: '',
      description: '',
    });

    this.editCategoryForm = this.fb.group({
      categoryImage: '',
      categoryTypeId: '',
      superCategoryId: '',
      category: '',
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
      childrenQuantity: '',
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
      .getSuperCategoryListByCategoryTypeId(rowData.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
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
      startDate: formatDate(rowData['startDate']),
      endDate: formatDate(rowData['endDate']),
      startTime: rowData['startTime'] ?? '',
      endTime: rowData['endTime'] ?? '',
      pickupLocation: rowData['pickupLocation'] ?? '',
      dropLocation: rowData['dropLocation'] ?? '',
      companyRate: rowData['companyRate'] ?? 0,
      companyRateForKids: rowData['companyRateForKids'] ?? 0,
      vendorRate: rowData['vendorRate'] ?? 0,
      vendorRateForKids: rowData['vendorRateForKids'] ?? 0,
      quantity: rowData['quantity'] ?? 0,
      childrenQuantity: rowData['childrenQuantity'] ?? 0,
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

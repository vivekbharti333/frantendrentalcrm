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
import { MatDialog } from '@angular/material/dialog';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.component.html',
  styleUrl: './sub-categories.component.scss',
  providers: [MessageService, ToastModule, NgxMaterialTimepickerModule],
})
export class SubCategoriesComponent {

  public addSubCategory!: FormGroup;

  public fieldForActivity: boolean = false;
  // public userList: any;

  public routes = routes;
  public categoryTypeList: any[] = [];
  public superCategoryList: any[] = [];
  public categoryList: any[] = [];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];

  filteredPickLocationList: any[] = [];
  filteredDropLocationList: any[] = [];

  public baseUrl = Constant.Site_Url;

  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables
  addSubCategoryDialog: any;
  editSubCategoryDialog: any;
  constructor(
        private fb: FormBuilder,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private categoriesManagementService: CategoriesManagementService,
    private dialog: MatDialog
  ) {}
  

  ngOnInit() {
    this.createForms();
    this.getCategoryType();
    this.getSubCategory();
    this.getPickLocation();
    this.getDropLocation();
  }

  allowedTimes = [
    '00:00', '00:15', '00:30', '00:45',
    '01:00', '01:15', '01:30', '01:45',
    // ... up to '23:45'
  ];
  

  // public addSubCategory = {
  //   subCategoryImage: '',
  //   categoryTypeId: '',
  //   superCategoryId: '',
  //   categoryId: '',
  //   subCategory: '',
  //   securityAmount: '',
  //   vendorRate: '',
  //   vendorRateForKids: '',
  //   startTime: '12:00',
  //   endTime: '',
  //   description: '',
  //   pickupLocation: '',
  //   dropLocation: ''
  // };

   createForms() {
      this.addSubCategory = this.fb.group({
        subCategoryImage: '',
        categoryTypeId: '',
        superCategoryId: '',
        categoryId: '',
        subCategory: '',
        securityAmount: '',
        companyRate: '',
        companyRateForKids: '',
        vendorRate: '',
        vendorRateForKids: '',
        quantity: '',
        childrenQuantity: '', 
        infantQuantity: '',
        startTime: '12:00',
        endTime: '',
        description: '',
        pickupLocation: '',
        dropLocation: ''
        
      });
    }

  public editSubCategory = {
    categoryTypeId: '',
    categoryTypeName: '',
    superCategory: '',
    superCategoryId: '',
    category: '',
    categoryId: '',
    subCategory: '',
    // securityAmount: '',
    // vendorRate: '',
    // description: '',
    createdAt: '',
    status: '',
  };

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          console.log("hi : "+this.categoryTypeList);
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


  async getSuperCategoryByCateTypeId(event: any): Promise<any> {
   
    return new Promise((resolve, reject) => {
      const selectedCateType = event.value; 

      // Set flag based on category type
    this.fieldForActivity = selectedCateType.categoryTypeName === 'ACTIVITY';
      
      this.categoriesManagementService
        .getSuperCategoryListByCategoryTypeId(selectedCateType.id)
        .subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              this.superCategoryList = JSON.parse(
                JSON.stringify(response.listPayload)
              );
              resolve(this.superCategoryList);
            } else {
              reject('Invalid response code');
            }
          },
          error: (error: any) => {
            this.messageService.add({
              summary: '500',
              detail: 'Server Error',
              styleClass: 'danger-background-popover',
            });
            reject(error);
          },
        });
    });
  }

  async getCategoryBySuperCatId(rowData: any) {
    return new Promise((resolve, reject) => {
      this.categoriesManagementService
        .getCategoryBySuperCatId(rowData.value)
        .subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              this.categoryList = JSON.parse(
                JSON.stringify(response.listPayload)
              );
              resolve(this.categoryList);
            } else {
              reject('Invalid response code');
            }
          },
          error: (error: any) => {
            this.messageService.add({
              summary: '500',
              detail: 'Server Error',
              styleClass: 'danger-background-popover',
            });
            reject(error);
          },
        });
    });
  }

  public getPickLocation() {
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
        this.messageService.add({ summary: '500', detail: 'Server Error', styleClass: 'danger-background-popover', }),
    });
  }

  public getDropLocation() {
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
        this.messageService.add({ summary: '500', detail: 'Server Error', styleClass: 'danger-background-popover', }),
    });
  }

  submitSubCategoryForm() {
    this.categoriesManagementService
      .addSubCategoryDetails(this.addSubCategory.value)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              // alert(response['payload']['respMesg']);
              //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
              // this.user;
              // this.modalInstance.hide();
              this.addSubCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getSubCategory();
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
    this.categoriesManagementService
      .changeSubCategoryStatus(rowdata)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getSubCategory();
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


  openAddModal(templateRef: TemplateRef<any>) {
    this.addSubCategoryDialog = this.dialog.open(templateRef, {
      width: '1400px', // or '80%', '40vw', etc.
      maxWidth: '200vw', // optional, for responsiveness
      disableClose: true // optional
    });
  }
  

  async openEditModal(templateRef: TemplateRef<any>, rowDate: any) {
    const filterCategoryType: any = this.categoryTypeList.filter((item) => {
      if (item?.categoryTypeName === rowDate[3]) {
        return item;
      }
    });


    await this.getSuperCategoryByCateTypeId({
      value: filterCategoryType[0]?.id,
    });
    const filterSuperCategory: any = this.superCategoryList.filter((item) => {
      if (item?.superCategory === rowDate[5]) {
        return item;
      }
    });
    await this.getCategoryBySuperCatId({ value: filterSuperCategory[0]?.id });
    const filterCategory: any = this.categoryList.filter((item) => {
      if (item?.category === rowDate[7]) {
        return item;
      }
    });
    this.editSubCategory = {
      categoryTypeId: filterCategoryType[0]?.id,
      categoryTypeName: rowDate[3],
      superCategory: rowDate[5],
      superCategoryId: filterSuperCategory[0]?.id,
      category: rowDate[7],
      categoryId: filterCategory[0]?.id,
      subCategory: rowDate[8],
      createdAt: rowDate[10],
      status: rowDate[9],
    };
  
    this.editSubCategoryDialog = this.dialog.open(templateRef, {
      width: '1400',      // Set the desired width
      maxWidth: '200vw'     // Optional: responsive max width
    });
    
    setTimeout(() => {
      // Your logic here (e.g., focusing input, triggering UI updates)
    }, 1000);
    
  }

  submitEditedSubCategoryForm() {
    this.categoriesManagementService
      .editSubCategoryDetails(this.editSubCategory)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.editSubCategoryDialog.close();
              this.messageService.add({
                summary: response['payload']['respCode'],
                detail: response['payload']['respMesg'],
                styleClass: 'success-background-popover',
              });
              this.getSubCategory();
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

  getSubCategory() {
    this.categoriesManagementService
      .getSubCategoryList()
      .subscribe((apiRes: any) => {
        this.totalData = apiRes.listPayload['length'];
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.subCategory) {
            this.getTableData({ skip: res.skip, limit: this.totalData });
            this.pageSize = res.pageSize;
          }
        });
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.categoriesManagementService
      .getSubCategoryList()
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
        // const dataSize = this.tableData.length;
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          serialNumberArray: this.serialNumberArray,
        });
        console.log('tabledata++++++', this.tableData);
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

  // onFileSelected(event: any) {
  //   const selectedFile = event.target.files[0];

  //   if (selectedFile) {
  //     const reader = new FileReader();
  //     reader.onload = (event: any) => {
  //       const base64String = event.target.result.split(',')[1]; // Get the base64 part

  //       // Set the base64 string to the userPicture field
  //       this.addSubCategory.subCategoryImage =
  //         'data:image/png;base64,' + base64String;
  //     };
  //     reader.readAsDataURL(selectedFile);
  //   }
  // }
}

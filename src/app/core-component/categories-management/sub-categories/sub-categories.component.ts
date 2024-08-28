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

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.component.html',
  styleUrl: './sub-categories.component.scss',
  providers: [MessageService, ToastModule],
})
export class SubCategoriesComponent {
  // public userList: any;

  public routes = routes;
  public categoryTypeList: any[]=[];
  public superCategoryList: any[]=[];
  public categoryList: any[]=[];
  public baseUrl =Constant.Site_Url;


  // pagination variables
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables



  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private categoriesManagementService: CategoriesManagementService,
    private dialog: MatDialog
  ) {
 
  }


  ngOnInit() {
    this.getCategoryType();
    this.getSubCategory();
  }

  public addSubCategory = {
    subCategoryImage: '',
    categoryTypeId: '',
    superCategoryId: '',
    categoryId: '',
    subCategory: '',
     
  };

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList()
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(JSON.stringify(response.listPayload));
          this.superCategoryList =[];
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  public getSuperCategoryByCateTypeId(rowData:any){
    this.categoriesManagementService.getSuperCategoryListByCategoryTypeId(rowData.value)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  public getCategoryBySuperCatId(rowData:any){
    alert("Enter : "+rowData.value);
    this.categoriesManagementService.getCategoryBySuperCatId(rowData.value)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }


  submitSubCategoryForm(){
    this.categoriesManagementService.addSubCategoryDetails(this.addSubCategory)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // alert(response['payload']['respMesg']);
            //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
          // this.user;
          // this.modalInstance.hide();
           this.messageService.add({
            summary: response['payload']['respCode'],
            detail: response['payload']['respMesg'],
            styleClass: 'success-background-popover',
          });
          
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
      error: () => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
      }),
    });
    // this.isLoading = false;
  }

  changeStatus(rowdata:any){
    this.categoriesManagementService.changeSubCategoryStatus(rowdata)
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
      error: () => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
      }),
    });
    // this.isLoading = false;
  }
  
  openAddModal(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  openEditModal(rowDate: any) {
    // this.categoryType.categoryTypeName = rowDate.categoryTypeName;
    // this.categoryType.status = rowDate.status; // Assign the value to user.firstName
    // this.categoryType.isChecked = rowDate.isChecked;
  }

  getSubCategory() {
    this.categoriesManagementService.getSubCategoryList().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.subCategory) {
          this.getTableData({ skip: res.skip, limit: this.totalData });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  private getTableData(pageOption: pageSelection): void {
   
      this.categoriesManagementService.getSubCategoryList().subscribe((apiRes: any) => {
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
        this.addSubCategory.subCategoryImage = "data:image/png;base64," + base64String;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

}


import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-categories-type',
  templateUrl: './categories-type.component.html',
  styleUrl: './categories-type.component.scss',
  providers: [MessageService, ToastModule],
})
export class CategoriesTypeComponent {
  @ViewChild('addUnitsModal') addUnitsModal!: ElementRef;
  modalInstance!: Modal;
  // public isAddModalVisible: boolean = false;

  public routes = routes;
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
  ) {
 
  }


  ngOnInit() {
    this.getCategoryType();
  }

  public categoryType = {
    categoryTypeName: '',
    status: '',
    isChecked: '', 
  };

  public editCategoryType = {
    id:'',
    categoryTypeName: '',
    status: '',
    isChecked: '', 
  };


  getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.categoryType) {
          this.getTableData({ skip: res.skip, limit: this.totalData });
          this.pageSize = res.pageSize;
        }
      });
    });
  }

  openAddModel(){
    // this.isAddModalVisible = true;
    this.modalInstance.show();
  }

  submitCategoryTypeForm(){
    this.categoriesManagementService.addCategoryType(this.categoryType)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // alert(response['payload']['respMesg']);
            //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
          // this.user;
          this.modalInstance.hide();
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

  openEditModal(rowDate: any) {
    this.editCategoryType.id = rowDate.id;
    this.editCategoryType.categoryTypeName = rowDate.categoryTypeName;
    this.editCategoryType.status = rowDate.status; // Assign the value to user.firstName
    this.editCategoryType.isChecked = rowDate.isChecked;
  }

  submitEditedCategoryTypeForm(){
    this.categoriesManagementService.editCategoryType(this.editCategoryType)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // alert(response['payload']['respMesg']);
            //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
          // this.user;
          this.getCategoryType();
          this.modalInstance.hide();

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

changeStatus(rowData: any){
    this.categoriesManagementService.changeCategoryTypeStatus(rowData)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // alert(response['payload']['respMesg']);
            //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
          // this.user;
          this.getCategoryType();
          this.modalInstance.hide();

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

  private getTableData(pageOption: pageSelection): void {
   
      this.categoriesManagementService.getCategoryTypeList().subscribe((apiRes: any) => {
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
}

import { Component, importProvidersFrom, TemplateRef } from '@angular/core';
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
import { LeadManagementService } from '../../lead-management.service';
// import { UserManagementService } from '../user-management.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/service/helper.service';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';

@Component({
  selector: 'app-all-lead',
  templateUrl: './all-lead.component.html',
  styleUrl: './all-lead.component.scss',
  providers: [MessageService, ToastModule],
})
export class AllLeadComponent {
  public followupList: any;

  public routes = routes;

  // pagination variables
  public tableData: Array<any> = [];
  public categoryTypeList: Array<any> = [];
  public superCategoryList: Array<any> = [];
  public categoryList: Array<any> = [];
  public subCategoryList: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<users>;
  public searchDataValue = '';
  //** / pagination variables
  viewLeadDetailsDialog: any;
  firstDate: any = '';
  lastDate: any = '';
  leadDetails = {
    categoryType: '',
    superCategory: '',
    category: '',
    subCategory: '',
    pickUpDateTime: '',
    pickUpLocation: '',
    dropDateTime: '',
    dropLocation: '',
    totalDays: '',
    quantity: '',
    vendorRate: '',
    companyRate: '',
    bookingAmount: '',
    balanceAmount: '',
    totalAmount: '',
    securityAmount: '',
    payToVendor: '',
    payToCompany: '',
    deliveryToCompany: '',
    deliveryToVendor: '',
    customerName: '',
    dialCode: '',
    mobile: '',
    alternateMobile: '',
    emailId: '',
    id: '',
    companyName: '',
    enquirySource: '',
    pickupPoint: '',
    dropPoint: '',
    status: '',
    leadOrigine: '',
    leadType: '',
    createdBy: '',
    notes: '',
  };
  isEditForm: boolean = false;
  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private dialog: MatDialog,
    private helper: HelperService,
    private categoriesManagementService: CategoriesManagementService
  ) {}

  ngOnInit() {
    this.getAllLeadList();
    this.getCategoryType();
  }

  // getAllLeadList() {
  //   this.leadManagementService.getAllLeadList().subscribe((apiRes: any) => {
  //     this.totalData = apiRes.totalNumber;
  //     this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
  //       if (this.router.url == this.routes.allLead) {
  //         this.getTableData({ skip: res.skip, limit: this.totalData });
  //         this.pageSize = res.pageSize;
  //       }
  //     });
  //   });
  // }

  getAllLeadList() {
    this.leadManagementService.getAllLeadList().subscribe((apiRes: any) => {
      this.setTableData(apiRes);
    });
  }

  setTableData(apiRes: any) {
    this.tableData = [];
    this.serialNumberArray = [];
    this.totalData = apiRes.totalNumber;
    this.pagination.tablePageSize.subscribe((pageRes: tablePageSize) => {
      if (this.router.url == this.routes.allLead) {
        apiRes.listPayload.map((res: any, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageRes.skip && serialNumber <= this.totalData) {
            this.tableData.push(res);
            this.setIsDataCopied(false, index);
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
      }
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

  async openEditModal(
    templateRef: TemplateRef<any>,
    rawData: any,
    isEditable: boolean
  ) {
    this.isEditForm = isEditable;
    await this.getDropdownOnEditModal(rawData);
    this.saveLeadData(rawData);
    this.viewLeadDetailsDialog = this.dialog.open(templateRef, {
      width: '80%',
    });
  }

  async getDropdownOnEditModal(rawData: any) {
    const filterCategoryType: any = this.categoryTypeList.filter((item) => {
      if (item?.categoryTypeName === rawData?.categoryTypeName) {
        return item;
      }
    });
    await this.getSuperCategory({
      value: filterCategoryType[0]?.id,
    });
    const filterSuperCategory: any = this.superCategoryList.filter((item) => {
      if (item?.superCategory === rawData?.superCategory) {
        return item;
      }
    });
    await this.getCategory({ value: filterSuperCategory[0]?.id });
    const filterCategory: any = this.categoryList.filter((item) => {
      if (item?.category === rawData?.category) {
        return item;
      }
    });
    await this.getSubCategory({ value: filterSuperCategory[0]?.id });
    const filterSubCategory: any = this.categoryList.filter((item) => {
      if (item?.category === rawData?.subCategory) {
        return item;
      }
      console.log(
        filterCategoryType,
        filterSuperCategory,
        filterCategory,
        filterSubCategory
      );
    });
  }
  saveLeadData(rawData: any) {
    const pickup = new Date(rawData?.pickupDateTime);
    const drop = new Date(rawData?.dropDateTime);
    const pickupDateTime = `${this.helper.addZeroInDateTime(
      pickup.getDate()
    )}-${this.helper.addZeroInDateTime(
      pickup.getMonth() + 1
    )}-${pickup.getFullYear()} ${this.helper.addZeroInDateTime(
      pickup.getHours()
    )}:${pickup.getMinutes()}`;
    const dropDateTime = `${this.helper.addZeroInDateTime(
      drop.getDate()
    )}-${this.helper.addZeroInDateTime(
      drop.getMonth() + 1
    )}-${drop.getFullYear()} ${this.helper.addZeroInDateTime(
      drop.getHours()
    )}:${drop.getMinutes()}`;
    this.leadDetails = {
      categoryType: rawData?.categoryTypeName,
      superCategory: rawData?.superCategory,
      category: rawData?.category,
      subCategory: rawData?.subCategory,
      pickUpDateTime: pickupDateTime,
      pickUpLocation: rawData?.pickupLocation,
      dropDateTime: dropDateTime,
      dropLocation: rawData?.dropLocation,
      totalDays: rawData?.totalDays,
      quantity: rawData?.quantity,
      vendorRate: rawData?.vendorRate,
      companyRate: rawData?.companyRate,
      bookingAmount: rawData?.bookingAmount,
      balanceAmount: rawData?.balanceAmount,
      totalAmount: rawData?.totalAmount,
      securityAmount: rawData?.securityAmount,
      payToVendor: rawData?.payToVendor,
      payToCompany: rawData?.payToCompany,
      deliveryToCompany: rawData?.deliveryAmountToCompany,
      deliveryToVendor: rawData?.deliveryAmountToVendor,
      customerName: rawData?.customeName,
      dialCode: rawData?.countryDialCode,
      mobile: rawData?.customerMobile,
      alternateMobile: '',
      emailId: rawData?.customerEmailId,
      id: rawData?.id,
      companyName: rawData?.companyName,
      enquirySource: rawData?.enquirySource,
      pickupPoint: rawData?.pickupPoint,
      dropPoint: rawData?.dropPoint,
      status: rawData?.status,
      leadOrigine: rawData?.leadOrigine,
      leadType: rawData?.leadType,
      createdBy: rawData?.createdBy,
      notes: rawData?.notes,
    };
  }

  async copyData(data: any, idx: number) {
    this.saveLeadData(data);
    this.helper.copyData(this.leadDetails);
    this.setIsDataCopied(true, idx);
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.tableData = this.dataSource.filteredData;
  }

  setIsDataCopied(val: boolean, idx: number) {
    for (const element of this.tableData) {
      element.isDataCopied = false;
    }
    this.tableData[idx]['isDataCopied'] = val;
  }

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredCategoryTypeList = this.categoryTypeList;
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

  public getSuperCategory(superCateId: any) {
    const categoryId = superCateId?.id;
    this.categoriesManagementService
      .getSuperCategoryListByCategoryTypeId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
            this.filteredSuperCategoryList = this.superCategoryList;
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

  public getCategory(categoryId: any) {
    const superCatId = categoryId?.id;
    this.categoriesManagementService
      .getCategoryBySuperCatId(superCatId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.categoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
            this.filteredCategoryList = this.categoryList;
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

  public getSubCategory(subCategoryId: any) {
    const categoryId = subCategoryId?.id;
    this.categoriesManagementService
      .getSubCategoryListByCatId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.subCategoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
            this.filteredSubCategoryList = this.subCategoryList;
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

  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
  setFilterList(listVal: any, typeOfList: any) {
    switch (typeOfList) {
      case 'categoryType':
        this.filteredCategoryTypeList = listVal;
        break;
      case 'superCategory':
        this.filteredSuperCategoryList = listVal;
        break;
      case 'category':
        this.filteredCategoryList = listVal;
        break;
      case 'subCategory':
        this.filteredSubCategoryList = listVal;
        break;
      default:
        break;
    }
  }
  filterByDate() {
    this.leadManagementService
      .getAllLeadListByDate(this.firstDate, this.lastDate)
      .subscribe((apiRes: any) => {
        this.setTableData(apiRes);
      });
  }
  setFilterDate(eve: any, date: any) {
    if (date === 'first') {
      this.firstDate = eve.target.value;
    }
    if (date === 'last') {
      this.lastDate = eve.target.value;
    }

    // this.firstDate = new Date().toISOString().slice(0, 16);
    // this.lastDate = new Date().toISOString().slice(0, 16);
  }
  updateLeadDetails() {
    this.leadManagementService.updateLeadDetails(this.leadDetails).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            // form.reset();
            this.messageService.add({
              summary: response['payload']['respCode'],
              detail: response['payload']['respMesg'],
              styleClass: 'success-background-popover',
            });
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
}

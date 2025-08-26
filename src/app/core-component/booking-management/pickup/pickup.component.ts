import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
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
import { Constant } from 'src/app/core/constant/constants';
import { MatDialog } from '@angular/material/dialog';
import { BookingManagementService } from '../booking-management.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

import { LeadManagementService } from '../../lead-management/lead-management.service';
import { SpinnerService } from 'src/app/core/core.index';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { CalendarModule } from 'primeng/calendar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface listData {
  value: string;
  name: string;
}


@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.component.html',
  styleUrl: './pickup.component.scss',
  providers: [MessageService, ToastModule],
})
export class PickupComponent {
  public loginUser: any;
  public fullData: any[] = [];
  pickupDate: string = '';
  dropoffDate: string = '';
  daysDifference: number = 0;
  pickupError: string = '';
  dropoffError: string = '';

  // pagination variables
  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<any>;
  public searchDataValue = '';

  public lastIndex = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;


  public vendorRate: any;
  public deliveryAmtToVendor: any;
  public payToVendor: any;
  public payToVendorAct: any;
  public payToCompany: any;
  public payToCompanyAct: any;

  public categoryList: any[] = [];
  public subCategoryList: any[] = [];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  public userList: any[] = [];

  // public routes = routes;
  public leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
  public leadType: listData[] = Constant.LEAD_TYPE_LIST;
  public leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  public minDate!: Date;
  public maxDate!: Date;

  public roleType: string = '';
  public fullName: string = '';

  public isActivities: Boolean = false;
  public addLeadForm!: FormGroup;

  public selectedOption: string = 'vehicle';
  public notesType: string = 'Notes';

  public discountType = '₹';
  public currentDate: any;

  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];
  filteredPickLocationList: any[] = [];
  filteredDropLocationList: any[] = [];

  constructor(
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private bookingManagementService: BookingManagementService,
    //  private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    // private sidebar: SidebarService,
    private leadManagementService: LeadManagementService,
    // private authenticationService: AuthenticationService,
    // private messageService: MessageService,
    private spinnerService: SpinnerService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
    private cookiesService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    this.loginUser = this.authenticationService.getLoginUser();
    this.roleType = this.cookiesService.get('roleType');
    this.fullName = this.cookiesService.get('firstName') + ' ' + this.cookiesService.get('lastName');
  }

  ngOnInit() {
    this.getDropList();
    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  }

   getDropList() {
    this.bookingManagementService.getDropList().subscribe((apiRes: any) => {
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
            // this.setIsDataCopied(false, index);
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


  // public getDropList(): void {

  //   this.serialNumberArray = [];

  //   this.bookingManagementService.getDropList().subscribe((apiRes: any) => {
  //     this.totalData = apiRes.totalNumber;
  //     this.fullData = apiRes.listPayload; // Store the full dataset

  //     this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
  //       if (this.router.url === this.routes.drop) {
  //         this.pageSize = res.pageSize;

  //         // Use the full dataset for pagination
  //         this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
  //         this.pageSize = res.pageSize;
  //       }
  //     });
  //   });
  // }
  // private prepareTableData(apiRes: any[], pageOption: pageSelection): void {
  //   this.tableData = [];
  //   this.serialNumberArray = [];

  //   apiRes.forEach((res: any, index: number) => {
  //     const serialNumber = index + 1;
  //     if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
  //       this.tableData.push(res);
  //       this.serialNumberArray.push(serialNumber);
  //     }
  //   });
  //   // Update the MatTableDataSource
  //   this.dataSource = new MatTableDataSource<any>(this.tableData);
  //   // Emit updated pagination data
  //   this.pagination.calculatePageSize.next({
  //     totalData: this.totalData,
  //     pageSize: this.pageSize,
  //     tableData: this.tableData,
  //     serialNumberArray: this.serialNumberArray,
  //   });
  // }


  // public sortData(sort: Sort) {
  //   const data = this.tableData.slice();
  //   if (!sort.active || sort.direction === '') {
  //     this.tableData = data;
  //   } else {
  //     this.tableData = data.sort((a, b) => {
  //       const aValue = (a as never)[sort.active];
  //       const bValue = (b as never)[sort.active];
  //       return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
  //     });
  //   }
  // }


  public searchData(value: string): void {
  //   const searchTerm = value.trim().toLowerCase();

  //   if (searchTerm) {
  //     // Filter the full dataset based on the search term
  //     const filteredData = this.fullData.filter((donation: any) =>
  //       Object.values(donation).some((field) =>
  //         String(field).toLowerCase().includes(searchTerm)
  //       )
  //     );

  //     this.prepareTableData(filteredData, { skip: 0, limit: this.pageSize });
  //     this.totalData = filteredData.length; // Update total data count for pagination
  //   } else {
  //     // Reset to the full dataset when the search term is cleared
  //     this.prepareTableData(this.fullData, { skip: 0, limit: this.pageSize });
  //     this.totalData = this.fullData.length; // Reset the total data count
  //   }

  //   // Reset to the first page after a search or clearing search
  //   this.pagination.calculatePageSize.next({
  //     totalData: this.totalData,
  //     pageSize: this.pageSize,
  //     tableData: this.tableData,
  //     serialNumberArray: this.serialNumberArray,
  //   });
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


  public getUserList() {
    this.userManagementService.getUserDetailsList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.userList = JSON.parse(JSON.stringify(response.listPayload));
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
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
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
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        }),
    });
  }

    percentOrAmount() {
    if (this.discountType === '₹') {
      this.discountType = '%';
      this.addLeadForm.patchValue({ discountType: 'Percent' });
    } else if (this.discountType === '%') {
      this.discountType = '₹';
      this.addLeadForm.patchValue({ discountType: 'Amount' });
    }
  }

  roundToNearest15Minutes(date: Date): Date {
    const ms = 1000 * 60 * 15;
    const rounded = Math.round(date.getTime() / ms) * ms;
    return new Date(rounded);
  }

  calculateDays() {
    const pickupDateTime = this.addLeadForm.value.pickupDateTime;
    const dropDateTime = this.addLeadForm.value.dropDateTime;

    if (pickupDateTime && dropDateTime) {
      let pickDate = new Date(pickupDateTime);
      let dropDate = new Date(dropDateTime);

      // Round both to nearest 15 minutes
      pickDate = this.roundToNearest15Minutes(pickDate);
      dropDate = this.roundToNearest15Minutes(dropDate);

      // Base day difference
      let noOfDays = Math.floor(
        (dropDate.setHours(0, 0, 0, 0) - pickDate.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
      );

      // Reset time to original (after date comparison)
      pickDate = new Date(pickupDateTime);
      dropDate = new Date(dropDateTime);
      pickDate = this.roundToNearest15Minutes(pickDate);
      dropDate = this.roundToNearest15Minutes(dropDate);

      // Apply rules:
      // If pickup is before 6:00 AM, add 1 day
      if (pickDate.getHours() < 6) {
        noOfDays += 1;
      }

      // If drop is after 9:00 AM, add 1 day
      if (dropDate.getHours() > 9 || (dropDate.getHours() === 9 && dropDate.getMinutes() > 0)) {
        noOfDays += 1;
      }

      // Ensure at least 1 day
      if (noOfDays < 1) noOfDays = 1;
      this.addLeadForm.patchValue({
        pickupDateTime: this.formatDateTime(pickDate),
        dropDateTime: this.formatDateTime(dropDate),
        totalDays: noOfDays,
      });

      this.addLeadForm.patchValue({
        actualAmount: 0,

      });

    }
  }

  formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  setError(field: 'pickupDate' | 'dropoffDate', message: string) {
    if (field === 'pickupDate') {
      this.pickupError = message;
      if (message) {
        setTimeout(() => {
          this.pickupError = '';
        }, 3000);
      }
    } else {
      this.dropoffError = message;
      if (message) {
        setTimeout(() => {
          this.dropoffError = '';
        }, 3000);
      }
    }
  }

  validateDateRange() {
    const start = new Date(this.pickupDate);
    const end = new Date(this.dropoffDate);

    if (start >= end) {
      this.setError('dropoffDate', 'Drop-off must be after Pickup');
      this.daysDifference = 0;
      this.dropoffDate = '';

      setTimeout(() => {
        const dropoffInput = document.getElementById(
          'dropoffDate'
        ) as HTMLInputElement;
        if (dropoffInput) {
          dropoffInput.value = '';
        }
      });
    } else {
      if (this.dropoffError !== 'Time must be in 15-minute intervals') {
        this.setError('dropoffDate', '');
      }
      this.calculateDaysDifference();
    }
  }

  calculateDaysDifference() {
    const start = new Date(this.pickupDate);
    const end = new Date(this.dropoffDate);

    const diffInMs = end.getTime() - start.getTime();
    this.daysDifference = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  setSecurityAndVendorRate(event: any) {

    const selectedSubCategory = event; // This now holds the full selected object
    const addFormValue = this.addLeadForm.value;

    if (addFormValue.categoryTypeName == Constant.ACTIVITY) {
      this.addTimeToDate(selectedSubCategory.startTime);
    }
    this.addLeadForm.patchValue({
      categoryTypeName: selectedSubCategory.categoryTypeName,
      superCategory: selectedSubCategory.superCategory,
      category: selectedSubCategory.category,
      subCategory: selectedSubCategory.subCategory,
      startTime: selectedSubCategory.startTime,
      endTime: selectedSubCategory.endTime,
      activityLocation: selectedSubCategory.activityLocation,
      pickDropHub: selectedSubCategory.pickDropHub,
      securityAmount: selectedSubCategory.securityAmount,
      vendorRate: selectedSubCategory.vendorRate,
      vendorRateForKids: selectedSubCategory.vendorRateForKids,
    });
  }

    addTimeToDate(timeString: string): string {
    const currentDate = new Date();

    // Extract hours and minutes from the time string (e.g., "14:53")
    const [hours, minutes] = timeString
      .split(':')
      .map((num) => parseInt(num, 10));

    // Set the hours and minutes to the current date
    currentDate.setHours(hours);
    currentDate.setMinutes(minutes);
    currentDate.setSeconds(0); // Optional: Set seconds to 0
    currentDate.setMilliseconds(0); // Optional: Set milliseconds to 0

    // Manually format the date into yyyy-MM-ddTHH:mm format
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based months
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedHours = String(currentDate.getHours()).padStart(2, '0');
    const formattedMinutes = String(currentDate.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}`;
    // Set the formatted date to the form control
    this.addLeadForm.patchValue({ pickupDateTime: formattedDate });

    return formattedDate;
  }

  calculationForActivity(): void {
    const leadValue = this.addLeadForm.value;

    const adultQuantity = Number(leadValue.quantity) || 0;
    const adultCompanyRate = Number(leadValue.companyRate) || 0;
    const kidQuantity = Number(leadValue.kidQuantity) || 0;
    const companyRateForKids = Number(leadValue.companyRateForKids) || 0;
    const adultVendorRate = Number(leadValue.vendorRate) || 0;
    const kidsVendorRate = Number(leadValue.vendorRateForKids) || 0;
    const discount = Number(leadValue.discount) || 0;
    const actualAmt = Number(leadValue.actualAmount) || 0;

    // Total Amount (Company Rate)
    const totalBeforeDiscount = (adultQuantity * adultCompanyRate) + (kidQuantity * companyRateForKids);
    const totalAmount = Math.max(totalBeforeDiscount - discount, 0);

    // Balance Amount (Vendor Rate)
    const balanceAmt = (adultQuantity * adultVendorRate) + (kidQuantity * kidsVendorRate);
    const balanceAmount = Math.max(balanceAmt, 0);

    // Booking Amount
    const bookingAmount = Math.max(totalAmount - balanceAmount, 0);

    // Extra Calculation
    let finalBalanceAmount = balanceAmount;

    if (actualAmt != 0) {
      if (bookingAmount >= actualAmt) {
        const extraAmt = bookingAmount - actualAmt;
        this.payToCompanyAct = extraAmt;
        this.payToVendorAct = 0;
        finalBalanceAmount = balanceAmount + extraAmt;
      } else {
        const extraAmt = actualAmt - bookingAmount;
        this.payToCompanyAct = 0;
        this.payToVendorAct = extraAmt;
        finalBalanceAmount = Math.max(balanceAmount - extraAmt, 0);
      }
    }
    // Patch all values at once
    this.addLeadForm.patchValue({
      totalAmount: totalAmount,
      balanceAmount: finalBalanceAmount,
      bookingAmount: bookingAmount,

      payToCompany: this.payToCompanyAct,
      payToVendor: this.payToVendorAct
    });
  }

  calculationForVehicle() {
    const leadValue = this.addLeadForm.value;

    const companyRate = Number(leadValue.companyRate) || 0;
    const totalDays = Number(leadValue.totalDays) || 0;
    const deliveryAmountToCompany = Number(leadValue.deliveryAmountToCompany) || 0;
    const quantity = Number(leadValue.quantity) || 0;
    const discount = Number(leadValue.discount) || 0;
    const actualAmt = Number(leadValue.actualAmount) || 0;
    const vendorRate = Number(leadValue.vendorRate) || 0;
    const deliveryAmountToVendor = Number(leadValue.deliveryAmountToVendor) || 0;
    const existingBalanceAmount = Number(leadValue.balanceAmount) || 0;

    // === Total Amount ===
    const compRatePerDay = companyRate * totalDays;
    const totalCompanyAmount = (compRatePerDay + deliveryAmountToCompany) * quantity;
    const totalAmount = totalCompanyAmount - discount;

    // === Balance Amount ===
    const vendorRatePerDay = vendorRate * totalDays;
    const totalVendorAmount = (vendorRatePerDay + deliveryAmountToVendor) * quantity;

    let balanceAmount = totalVendorAmount;

    // === Booking Amount ===
    const bookingAmount = totalAmount - existingBalanceAmount;

    // === Adjusted Balance Based on Actual Amount ===
    if (actualAmt > 0) {
      if (bookingAmount >= actualAmt) {
        const extraAmt = bookingAmount - actualAmt;
        this.payToCompany = extraAmt;
        this.payToVendor = 0;
        balanceAmount += extraAmt;
      } else {
        const extraAmt = actualAmt - bookingAmount;
        this.payToCompany = 0;
        this.payToVendor = extraAmt;
        balanceAmount = Math.max(balanceAmount - extraAmt, 0);
      }
    }

    // ✅ Always patch values
    this.addLeadForm.patchValue({
      totalAmount: totalAmount,
      balanceAmount: balanceAmount,
      bookingAmount: bookingAmount,
      payToCompany: this.payToCompany,
      payToVendor: this.payToVendor
    });
  }

    onNotesTypeChange(value: string) {
    this.notesType = value;
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
      case 'pickLocation':
        this.filteredPickLocationList = listVal;
        break;
      case 'dropLocation':
        this.filteredDropLocationList = listVal;
        break;
      default:
        break;
    }
  }

  updateLeadDetails(){

  }

}


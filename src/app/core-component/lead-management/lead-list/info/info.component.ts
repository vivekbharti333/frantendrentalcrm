import { Component, TemplateRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { LeadManagementService } from '../../lead-management.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HelperService } from 'src/app/core/service/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { UserManagementService } from '../../../user-management/user-management.service';
import { InfoService } from './info.service'; 
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BookingManagementService } from 'src/app/core-component/booking-management/booking-management.service';


export interface listData {
  value: string;
  name: string;
}

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
  providers: [MessageService, ToastModule],
})
export class InfoComponent {

  public tooltipMessage: string = 'Copy';
    
      public followupList: any;
      public userForDropDown: any[] = [];
      public pickLocationList: any[] = [];
      public dropLocationList: any[] = [];
      filteredPickLocationList: any[] = [];
      filteredDropLocationList: any[] = [];
    
      public editLeadForm!: FormGroup;
      public changeStatusForm!: FormGroup;
      public searchByDateForm! : FormGroup;
      public minDate!: Date;
      public maxDate!: Date;
    
      public roleType: string = '';
      public fullName: string = '';
    
      public isActivities: Boolean = false;
    
      public vendorRate: any;
      public deliveryAmtToVendor: any;
      public payToVendor: any;
      public payToCompany: any;
    
      public discountType = '₹';
    
      pickupDate: string = '';
      dropoffDate: string = '';
      daysDifference: number = 0;
      pickupError: string = '';
      dropoffError: string = '';
    
      activityDate: string = '2025-05-01';
      startTime: string = '10:00';
      endTime: string = '18:00';
      locationType: string = 'self';
    
      public name: any;
      public mobile: any;
       public selectedOption: string = 'vehicle';
      public notesType: string = 'Notes';
      // public payToVendor: any;
      public payToVendorAct: any;
      // public payToCompany: any;
      public payToCompanyAct: any;
    
    
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
      // roleType: string = '';
      //** / pagination variables
      viewLeadDetailsDialog: any;
      statusLeadDialogTemplate: any;
    
      firstDate: any = '';
      lastDate: any = '';
      
      isEditForm: boolean = false;
      filteredCategoryTypeList: any[] = [];
      filteredSuperCategoryList: any[] = [];
      filteredCategoryList: any[] = [];
      filteredSubCategoryList: any[] = [];
    
      allIds = {
        superCategoryId: '',
        categoryTypeId: '',
      }
    
    
      public userList: any[] = [];
      leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
      leadType: listData[] = Constant.LEAD_TYPE_LIST;
      leadStatus: listData[] = Constant.LEAD_STATUS_FOR_PICKUP_LIST;
      constructor(
        private fb: FormBuilder,
        private pagination: PaginationService,
        private router: Router,
        private sidebar: SidebarService,
        private messageService: MessageService,
        private InfoService: InfoService,
        private leadManagementService: LeadManagementService,
        private dialog: MatDialog,
        private helper: HelperService,
        private categoriesManagementService: CategoriesManagementService,
        private userManagementService: UserManagementService,
        private cookieService: CookieService,
        private datePipe: DatePipe
      ) { }
    
      ngOnInit() {
        this.getInfoList('TODAY');
        this.getUserListForDropDown();
        this.getCategoryType();
        this.getPickLocation();
        this.getDropLocation();
        this.createForms();
        this.initializeComponent();
      }
    
      initializeComponent(): void {
        this.getCategory('');
        // this.getSubCategory('');
        this.createForms();
        this.getCategoryType();
        // this.getCategory();
        this.getPickLocation();
        this.getDropLocation();
        this.calculateDays();
    
        this.roleType === 'SUPERADMIN'
          ? (this.editLeadForm.value.createdBy = '')
          : (this.editLeadForm.value.createdBy = this.fullName);
    
        this.minDate = new Date();
        this.minDate.setHours(0, 0, 0, 0);
        this.maxDate = new Date();
        this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);
    
        this.setDefaultDateTime();
    
        const now = new Date();
        const pickup = this.roundToPrevious15Minutes(now);
        const dropoff = new Date(pickup);
        dropoff.setDate(dropoff.getDate() + 1);
    
        this.pickupDate = this.formatDateTime(pickup);
        this.dropoffDate = this.formatDateTime(dropoff);
        this.minDate = new Date(this.pickupDate);
    
        this.validateDateRange();
      }
    
    
      createForms() {
        this.editLeadForm = this.fb.group({
          id: [],
          companyName: ['Notes'],
          enquirySource: ['Call'],
          categoryTypeId: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')],],
          categoryTypeName: [''],
          superCategoryId: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')],],
          categoryId: [''],
          subCategoryId: [''],
          superCategory: [''],
          category: [''],
          subCategory: [''],
          itemName: [''],
          pickupDateTime: [''],
          pickupHub: [''],
          pickupPoint: [''],
          dropDateTime: [''],
          dropHub: [''],
          dropPoint: [''],
          customeName: [''],
          countryDialCode: [''],
          customerMobile: [''],
          customerAlternateMobile: [''],
          customerEmailId: [''],
          totalDays: [''],
          quantity: 1,
          kidQuantity: [''],
          infantQuantity: [''],
          vendorRate: 0,
          vendorRateForKids: 0,
          payToVendor: 0,
          companyRate: 0,
          companyRateForKids: 0,
          payToCompany: 0,
          bookingAmount: 0,
          balanceAmount: 0,
          totalAmount: 0,
          actualAmount: 0,
          securityAmount: [''],
          discountType: [''],
          discount: 0,
          deliveryAmountToCompany: 0,
          deliveryAmountToVendor: 0,
          status: [''],
          leadOrigine: [''],
          leadType: [''],
          createdBy: [''],
          notes: [''],
          followupDateTime: [''],
          remarks: [''],
          preValue: `    Reports : 
                Delivery : 
                Comments : 
                Pay to vendor : 
                Pay to company :`,
          reminderDate: [''],
          records: [''],
        });
    
        this.changeStatusForm = this.fb.group({
          id: [],
          customeName: [''],
          countryDialCode: [''],
          customerMobile: [''],
          vendorName: [''],
          status: [''],
        });
    
        this.searchByDateForm = this.fb.group({
          firstDate: [''],
          lastDate: [''],
          status: ['INFO'],
        });
      }
    
      downloadInvoice(receiptNo: string) {
        window.open(Constant.Site_Url + "paymentreceipt/" + receiptNo, '_blank');
      }
    
      public getUserListForDropDown() {
        this.userManagementService.getUserListForDropDown().subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              this.userForDropDown = JSON.parse(JSON.stringify(response.listPayload));
            }
          },
          error: (error: any) => this.messageService.add({
            summary: '500',
            detail: 'Server Error',
            styleClass: 'danger-background-popover',
          })
        });
      }
    
      submitSeachByDateForm() {
        this.InfoService.getInfoListByDateSearch(this.searchByDateForm.value)
          .subscribe((apiRes: any) => {
            this.setTableData(apiRes);
          });
      }
    
      getInfoList(requestFor: any) {
        this.InfoService.getInfoList(requestFor,'INFO')
          .subscribe((apiRes: any) => {
            this.setTableData(apiRes);
          });
      }
    
    
      setTableData(apiRes: any) {
        this.tableData = [];
        this.serialNumberArray = [];
        this.totalData = apiRes.totalNumber;
        this.pagination.tablePageSize.subscribe((pageRes: tablePageSize) => {
          if (this.router.url == this.routes.infoLead) {
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
    
      openStatusModel(templateRef: TemplateRef<any>,
        rawData: any) {
    
        this.changeStatusForm.patchValue({
          id: rawData['id'],
          customeName: rawData['customeName'],
          countryDialCode: rawData['countryDialCode'],
          customerMobile: rawData['customerMobile'],
          status: rawData['status'],
          vendorName: rawData['vendorName'],
        })
        this.name = rawData.customeName;
        this.mobile = rawData.countryDialCode + " " + rawData.customerMobile;
    
        this.statusLeadDialogTemplate = this.dialog.open(templateRef, {
          width: '50%',
        });
      }
    
    
      async openEditModal(
        templateRef: TemplateRef<any>,
        rawData: any,
        isEditable: boolean
    
      ) {
    
        if(!['car', 'bike'].includes(rawData['categoryTypeName']?.toLowerCase())) {
          this.selectedOption === 'activity';
        } else {
          this.selectedOption == 'vehicle'
        }
    
        this.isEditForm = isEditable;
        // this.getSubCategory(rawData['categoryId']);
        this.editLeadForm.patchValue({
          id: rawData['id'],
          category: rawData['category'],
          subCategory: rawData['subCategory'],
          itemName: rawData['itemName'],
          pickupDateTime: this.formatDateTime(rawData['pickupDateTime']),
          pickupHub: rawData['pickupHub'],
          pickupPoint: rawData['pickupPoint'],
          dropDateTime: this.formatDateTime(rawData['dropDateTime']),
          dropHub: rawData['dropHub'],
          dropPoint: rawData['dropPoint'],
          customeName: rawData['customeName'],
          countryDialCode: rawData['countryDialCode'],
          customerMobile: rawData['customerMobile'],
          customerAlternateMobile: rawData['customerAlternateMobile'],
          customerEmailId: rawData['customerEmailId'],
          totalDays: rawData['totalDays'],
          quantity: rawData['quantity'],
          kidQuantity: rawData['kidQuantity'],
          infantQuantity: rawData['infantQuantity'],
          vendorRate: rawData['vendorRate'],
          vendorRateForKids: rawData['vendorRate'],
          payToVendor: rawData['payToVendor'],
          companyRate: rawData['companyRate'],
          companyRateForKids: rawData['companyRateForKids'],
          payToCompany: rawData['payToCompany'],
          bookingAmount: rawData['bookingAmount'],
          balanceAmount: rawData['balanceAmount'],
          totalAmount: rawData['totalAmount'],
          actualAmount: rawData['actualAmount'],
          securityAmount: rawData['securityAmount'],
          discountType: rawData['discountType'],
          discount: rawData['discount'],
          deliveryAmountToCompany: rawData['deliveryAmountToCompany'],
          deliveryAmountToVendor: rawData['deliveryAmountToVendor'],
          status: rawData['status'],
          leadOrigine: rawData['leadOrigine'],
          leadType: rawData['leadType'],
          createdBy: rawData['createdBy'],
          notes: rawData['notes'],
          followupDateTime: rawData['followupDateTime'],
          remarks: rawData['remarks'],
          // preValue: `    Reports : 
          //   Delivery : 
          //   Comments : 
          //   Pay to vendor : 
          //   Pay to company :`,
          // reminderDate: [''],
          // records: 
    
        });
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
    
    
      adjustToNearest15Min(event: Event, field: 'startTime' | 'endTime') {
        const input = event.target as HTMLInputElement;
        const timeStr = input.value;
    
        if (!timeStr || !timeStr.includes(':')) return;
    
        const [hourStr, minuteStr] = timeStr.split(':');
        let hours = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
    
        let roundedMinutes = Math.round(minute / 15) * 15;
    
        if (roundedMinutes === 60) {
          roundedMinutes = 0;
          hours = (hours + 1) % 24;
        }
    
        const correctedTime = `${this.pad(hours)}:${this.pad(roundedMinutes)}`;
    
        // Correctly update the corresponding field
        if (field === 'startTime') {
          this.startTime = correctedTime;
        } else {
          this.endTime = correctedTime;
        }
        // Update input display value explicitly
        input.value = correctedTime;
      }
    
      pad(num: number): string {
        return num < 10 ? '0' + num : num.toString();
      }
    
      roundToPrevious15Minutes(date: Date): Date {
        const newDate = new Date(date);
        const minutes = newDate.getMinutes();
        const remainder = minutes % 15;
        newDate.setMinutes(minutes - remainder);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        return newDate;
      }
    
      formatDateTime(dateInput: any): string {
        if (!dateInput) return ''; // handle undefined or null immediately
    
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return ''; // handle invalid date
    
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
    
      calculateTotalAmountAndBalaenceAmontAfterDiscount1() {
        //total amount start
        if (
          this.editLeadForm.value &&
          this.editLeadForm.value.companyRate != null &&
          this.editLeadForm.value.totalDays != null &&
          this.editLeadForm.value.deliveryAmountToCompany != null &&
          this.editLeadForm.value.quantity != null
        ) {
          const firstValue =
            this.editLeadForm.value.companyRate * this.editLeadForm.value.totalDays;
          const secondValue =
            firstValue + Number(this.editLeadForm.value.deliveryAmountToCompany); // Ensure numeric addition
    
          this.editLeadForm.patchValue({
            totalAmount: secondValue * this.editLeadForm.value.quantity,
          });
    
          //total amount end
    
          // booking amount start
          this.editLeadForm.patchValue({
            bookingAmount:
              secondValue * this.editLeadForm.value.quantity -
              this.editLeadForm.value.balanceAmount,
          });
          //bokking amount end
        }
    
        const discount = this.editLeadForm.value.discount;
    
        // Ensure discount is not more than the total amount
        const totalAmt = this.editLeadForm.value.totalAmount - discount;
        const balanceAmt = this.editLeadForm.value.balanceAmount;
        const bookingAmt = totalAmt - balanceAmt;
    
        // Update the form with all new values in one patchValue call
        this.editLeadForm.patchValue({
          totalAmount: totalAmt,
          bookingAmount: bookingAmt,
        });
      }
    
      percentOrAmount() {
        if (this.discountType === '₹') {
          this.discountType = '%';
          this.editLeadForm.patchValue({ discountType: 'Percent' });
        } else if (this.discountType === '%') {
          this.discountType = '₹';
          this.editLeadForm.patchValue({ discountType: 'Amount' });
        }
      }
    
    
      calculateDaysDifference() {
        const start = new Date(this.pickupDate);
        const end = new Date(this.dropoffDate);
    
        const diffInMs = end.getTime() - start.getTime();
        this.daysDifference = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      }
    
    
      setSecurityAndVendorRate(event: any) {
        const selectedSubCategory = event.value; // This now holds the full selected object
        const addFormValue = this.editLeadForm.value;
    
        // add date and time automatic from sub category
        const startTime = selectedSubCategory.startTime;
        const endTime = selectedSubCategory.endTime;
    
        if (addFormValue.categoryTypeName == Constant.ACTIVITY) {
          this.addTimeToDate(selectedSubCategory.startTime);
        }
    
        this.editLeadForm.patchValue({
          securityAmount: selectedSubCategory.securityAmount,
        });
        this.editLeadForm.patchValue({ vendorRate: selectedSubCategory.vendorRate });
        this.editLeadForm.patchValue({
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
    
        console.log('hi : ' + formattedDate);
    
        // Set the formatted date to the form control
        this.editLeadForm.patchValue({ pickupDateTime: formattedDate });
    
        return formattedDate;
      }
    
      // calExtraAmount() {
    
      // }
    
      setDefaultDateTime(): void {
        const currentDate = new Date();
    
        // Get the local date and time values
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    
        // Combine into the required format: YYYY-MM-DDTHH:MM
        const dateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
        // Patch the value into the form
        this.editLeadForm.patchValue({
          dropDateTime: dateTime,
          pickupDateTime: dateTime,
        });
      }
    
      calculateDays() {
        const pickupDateTime = this.editLeadForm.value.pickupDateTime;
        const dropDateTime = this.editLeadForm.value.dropDateTime;
    
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
    
          console.log({
            pickupDateTime: this.formatDateTime(pickDate),
            dropDateTime: this.formatDateTime(dropDate),
            totalDays: noOfDays,
          });
    
          this.editLeadForm.patchValue({
            pickupDateTime: this.formatDateTime(pickDate),
            dropDateTime: this.formatDateTime(dropDate),
            totalDays: noOfDays,
          });
        }
      }
    
      roundToNearest15Minutes(date: Date): Date {
        const ms = 1000 * 60 * 15;
        const rounded = Math.round(date.getTime() / ms) * ms;
        return new Date(rounded);
      }
    
      checkCategoryType(categoryType: any) {
        if (categoryType.categoryTypeName === Constant.ACTIVITY) {
          this.isActivities = true;
        } else {
          this.isActivities = false;
        }
      }
    
        onSelectionChange(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.selectedOption = inputElement.value;
        this.initializeComponent();
      }
    
      ////////////////////////////////////////////////////////////////////////////////////Below old------------------
      setDateTime(date: any): string {
    
        const currentDate = new Date(date);
    
        // Adjust to local time zone
        const timeZoneOffset = currentDate.getTimezoneOffset() * 60000; // offset in milliseconds
        const localDate = new Date(currentDate.getTime() - timeZoneOffset);
    
        // Round minutes to the nearest 15-minute interval
        const minutes = localDate.getMinutes();
        const roundedMinutes = Math.ceil(minutes / 15) * 15;
        localDate.setMinutes(roundedMinutes);
        localDate.setSeconds(0);
        localDate.setMilliseconds(0);
    
        // Format the date to the required input format: YYYY-MM-DDTHH:MM
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutesFormatted = String(localDate.getMinutes()).padStart(2, '0');
    
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutesFormatted}`;
    
        return formattedDateTime;
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
    
      public getCategoryType() {
        this.categoriesManagementService.getCategoryTypeList().subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              this.categoryTypeList = JSON.parse(JSON.stringify(response.listPayload));
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
    
    
    
      public getCategory(categoryId: any) {
        this.categoriesManagementService.getCategoryBySuperCatId(categoryId)
          .subscribe({
            next: (response: any) => {
              if (response['responseCode'] == '200') {
                this.categoryList = JSON.parse(JSON.stringify(response.listPayload));
                this.filteredCategoryList = this.categoryList;
    
                // const subCategory = this.categoryList.find(item => item.category === this.leadDetails.category);
                // this.getSubCategory(subCategory.id);
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
        this.InfoService
          .getInfoList('TODAY','INFO')
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
      }
    
      changeLeadStatus() {
        this.leadManagementService.changeLeadStatus(this.changeStatusForm.value).subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              if (response['payload']['respCode'] == '200') {
                this.changeStatusForm.reset();
                this.getInfoList('TODAY');
    
                this.statusLeadDialogTemplate.close();
    
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
    
    
      updateLeadDetails() {
        this.leadManagementService.updateLeadDetails(this.editLeadForm).subscribe({
          next: (response: any) => {
            if (response['responseCode'] == '200') {
              if (response['payload']['respCode'] == '200') {
                this.editLeadForm.reset();
                
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
    
    
      getBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
          case 'enquiry':
            return 'badge-linesuccess';
          case 'lost':
            return 'badge-linedanger';
          case 'info':
            return 'badge-lineinfo';
          case 'followup':
            return 'badge-linewarning';
          case 'win':
            return 'badge-linewin';
          case 'assigned':
            return 'badge-lineassigned';
          case 'reserved':
            return 'badge-linereserved';
          default:
            return 'badge-default'; // Default class if no match
        }
      }
    
        onNotesTypeChange(value: string) {
        this.notesType = value;
      }
    
      calculationForActivity(): void {
        const leadValue = this.editLeadForm.value;
    
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
        this.editLeadForm.patchValue({
          totalAmount: totalAmount,
          balanceAmount: finalBalanceAmount,
          bookingAmount: bookingAmount,
    
          payToCompany: this.payToCompanyAct,
          payToVendor: this.payToVendorAct
        });
      }
    
      calculationForVehicle() {
        const leadValue = this.editLeadForm.value;
    
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
        this.editLeadForm.patchValue({
          totalAmount: totalAmount,
          balanceAmount: balanceAmount,
          bookingAmount: bookingAmount,
          payToCompany: this.payToCompany,
          payToVendor: this.payToVendor
        });
      }
    
      copyText(rowData: any) {
        let pickupDate = this.datePipe.transform(rowData['pickupDateTime'], 'dd-MM-yyyy | HH:mm');
        let dropDate = this.datePipe.transform(rowData['pickupDateTime'], 'dd-MM-yyyy | HH:mm');
        let text = '';
    
        if (!['car', 'bike'].includes(rowData['categoryTypeName']?.toLowerCase())) {
          text = "*Package Name: " + rowData['category'] + "*\n\n" +
            "Date " + pickupDate + ",\n\n" +
            "Customer Name: " + rowData['customeName'] + "\n\n" +
            "Phone Number: " + rowData['customerMobile'] + "\n\n" +
            "Pickup Point: " + rowData['pickupPoint'] + "\n\n" +
            "Drop Point: " + rowData['dropPoint'] + "\n\n" +
            "Adult: " + rowData['quantity'] + "\n\n" +
            "Kids: " + rowData['kidQuantity'] + "\n\n" +
            "Infant: " + rowData['infantQuantity'] + "\n\n" +
            "Remarks: " + rowData['remarks'] + "\n\n" +
            "*Balance Amount: ₹ " + rowData['balenceAmount'] + "*\n\n";
        } else {
          text = "*Vehicle Name: " + rowData['category'] + "*\n\n" +
            "Vehicle Type: " + rowData['subCategory'] + "\n" +
            "Adult: " + rowData['quantity'] + "\n" +
            "Customer Name: " + rowData['customeName'] + "\n" +
            "Phone Number: " + rowData['customerMobile'] + "\n" +
            "Pickup Date " + pickupDate + ",\n" +
            "Drop Date " + dropDate + ",\n" +
            "Pickup Point: " + rowData['pickupPoint'] + "\n" +
            "Drop Point: " + rowData['dropPoint'] + "\n\n" +
            "*Balance Amount: ₹ " + rowData['balenceAmount'] + "*\n\n" +
            "*Refundable Deposit: ₹ " + rowData['securityAmount'] + "*\n\n" +
            rowData['remarks'];
        }
    
        navigator.clipboard.writeText(text).then(() => {
          this.tooltipMessage = 'Copied!'; // Show "Copied!" text
          setTimeout(() => {
            this.tooltipMessage = 'Copy'; // Reset back after 1.5 seconds
          }, 1500);
        }).catch(err => {
          console.error('Could not copy text: ', err);
        });
      }
    
    
    
    
    }
    
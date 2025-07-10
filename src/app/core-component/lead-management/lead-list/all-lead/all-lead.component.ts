import { Component, importProvidersFrom, TemplateRef, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/core/service/helper.service';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { UserManagementService } from '../../../user-management/user-management.service';
import {MatTabsModule} from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie-service';
import { Constant } from 'src/app/core/constant/constants';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


import { AuthenticationService } from 'src/app/auth/authentication.service';
import { SpinnerService } from 'src/app/core/core.index';
import { CalendarModule } from 'primeng/calendar';




interface listData {
  value: string;
  name: string;
}

@Component({
  selector: 'app-all-lead',
  templateUrl: './all-lead.component.html',
  styleUrl: './all-lead.component.scss',
  providers: [MessageService, ToastModule],
})

export class AllLeadComponent {
  public followupList: any;
  public userForDropDown : any[]=[];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  filteredPickLocationList: any[] =[];
  filteredDropLocationList: any[] =[];

  public editLeadForm!: FormGroup;
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
  firstDate: any = '';
  lastDate: any = '';
  leadDetails = {
    categoryType: '',
    superCategory: '',
    category: '',
    subCategory: '',
    pickupDateTime: '',
    pickupLocation: '',
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
    records: '',
    remarks: '',
    reminderDate: '',
    // leadStatus:'',
  };
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
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;
  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private pagination: PaginationService,
    private router: Router,
    private sidebar: SidebarService,
    private messageService: MessageService,
    private leadManagementService: LeadManagementService,
    private dialog: MatDialog,
    private helper: HelperService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
    private cookieService: CookieService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.getAllLeadList();
    this.getUserListForDropDown();
    this.getCategoryType();
    this.getPickLocation();
    this.getDropLocation();
    this.createForms();
    this.initializeComponent();
  }

  initializeComponent(): void {
    this.getCategory('');
    this.getSubCategory('');
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
    }

  downloadInvoice(receiptNo : string) {
    window.open(Constant.Site_Url+"paymentreceipt/"+receiptNo, '_blank');
    // console.log(Constant.Site_Url+"paymentreceipt/"+receiptNo);
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

  onAgentSelectionChange(dd:any){
    this.leadManagementService.getAllLeadList('AGENT').subscribe((apiRes: any) => {
      this.setTableData(apiRes);
    });
  }

  getAllLeadList() {
    this.leadManagementService.getAllLeadList(this.cookieService.get('roleType')).subscribe((apiRes: any) => {
      this.setTableData(apiRes);
      console.log("Data : "+ apiRes);
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

  async openEditModal(
    templateRef: TemplateRef<any>,
    rawData: any,
    isEditable: boolean
    
  ) {
   
    this.isEditForm = isEditable;
    this.getSubCategory(rawData['categoryId']);

    this.editLeadForm.patchValue({
      
        category: rawData['category'],
        subCategory: rawData['subCategory'],
        itemName: rawData['itemName'],
        pickupDateTime: this.formatDateTime(rawData['pickupDateTime']),
        pickupHub: rawData['pickupHub'],
        pickupPoint: rawData['pickupPoint'],
        dropDateTime: rawData['dropDateTime'],
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
    // const addFormValue = this.editLeadForm.value;

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

  calculateTotalAmountAndBalaenceAmontAfterDiscount() {
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

      // this.editLeadForm.patchValue({ totalAmount: secondValue * this.editLeadForm.value.quantity });

      //total amount end

      // Ensure discount is not more than the total amount
      const totalAmt = secondValue * this.editLeadForm.value.quantity - this.editLeadForm.value.discount;
      const balanceAmt = this.editLeadForm.value.balanceAmount;
      const bookingAmt = totalAmt - balanceAmt;


      // Update the form with all new values in one patchValue call
      this.editLeadForm.patchValue({
        totalAmount: totalAmt,
        bookingAmount: bookingAmt,
      });
    }
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

  calExtraAmount() {
    const leadValue = this.editLeadForm.value;
    let secondValue = 0;
    if (
      leadValue.vendorRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToVendor != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.vendorRate * leadValue.totalDays;
      secondValue = firstValue + Number(leadValue.deliveryAmountToVendor);
      this.editLeadForm.patchValue({
        balanceAmount: secondValue * leadValue.quantity,
      });
    }

    const bookAmt = this.editLeadForm.value.bookingAmount;
    const actAmt = this.editLeadForm.value.actualAmount;
    const balAmt = this.editLeadForm.value.balanceAmount;

    if (bookAmt >= actAmt) {
      // const extraAmtPlus = actAmt - bookAmt; // Corrected logic
      this.editLeadForm.patchValue({
        balanceAmount: balAmt + (bookAmt - actAmt),
      });
      this.payToVendor = this.editLeadForm.value.balanceAmount;
    } else {
      // const extraAmtMinus = bookAmt - actAmt; // Corrected logic
      this.editLeadForm.patchValue({
        balanceAmount: balAmt - (actAmt - bookAmt),
      });
      this.payToVendor = this.editLeadForm.value.balanceAmount;
    }
  }

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

  // calculateDays() {
  //   const pickupDateTime = this.editLeadForm.value.pickupDateTime;
  //   const dropDateTime = this.editLeadForm.value.dropDateTime;

  //   if (pickupDateTime && dropDateTime) {
  //     let pickDate = new Date(pickupDateTime);
  //     let dropDate = new Date(dropDateTime);

  //     // Adjust pickup date if time is before 6:00 AM
  //     if (pickDate.getHours() < 6) {
  //       pickDate.setDate(pickDate.getDate() - 1);
  //     }

  //     // Adjust drop date if time is before 9:00 AM
  //     if (dropDate.getHours() > 9) {
  //       dropDate.setDate(dropDate.getDate() + 1);
  //     }

  //     const timeDifference = dropDate.getTime() - pickDate.getTime();
  //     const noOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

  //     this.editLeadForm.patchValue({ totalDays: noOfDays });
  //   }
  // }

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

  // formatDateTime(date: Date): string {
  //   const pad = (n: number) => n.toString().padStart(2, '0');
  //   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  // }

  calculateTotalAmount() {
    const leadValue = this.editLeadForm.value;
    let secondValue = 0;
    if (
      leadValue &&
      leadValue.companyRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToCompany != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.companyRate * leadValue.totalDays;
      const secondValue =
        firstValue + Number(leadValue.deliveryAmountToCompany); // Ensure numeric addition

      this.editLeadForm.patchValue({
        totalAmount: secondValue * leadValue.quantity,
      });

      this.deliveryAmtToVendor = this.editLeadForm.value.deliveryAmountToVendor;
      this.vendorRate = this.editLeadForm.value.vendorRate;

      // this.calExtraAmount();

      this.calculateBalanceAmount();
      this.calculatePayToCompanyAndPayToVendor();

      this.editLeadForm.patchValue({ actualAmount: 0, discount: 0 });
    } else {
      console.error('Some required fields are missing for total amount calculation.'
      );
      leadValue.totalAmount = 0; // Set a fallback value
    }
    return secondValue * leadValue.quantity;
  }

  calculateBalanceAmount(): number {
    const leadValue = this.editLeadForm.value;
    let secondValue = 0;
    if (
      leadValue.vendorRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToVendor != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.vendorRate * leadValue.totalDays;
      secondValue = firstValue + Number(leadValue.deliveryAmountToVendor);
      this.editLeadForm.patchValue({
        balanceAmount: secondValue * leadValue.quantity,
      });

      this.calculateBookingAmount();
      this.calculatePayToCompanyAndPayToVendor();
    } else {
      console.error(
        'Some required fields are missing for balance amount calculation.'
      );
      leadValue.balanceAmount = 0; // Set a default fallback value
    }
    return secondValue * leadValue.quantity;
  }

  calculateBookingAmount(): number {
    const leadValue = this.editLeadForm.value;
    this.editLeadForm.patchValue({
      bookingAmount: leadValue.totalAmount - leadValue.balanceAmount,
    }),
      this.calculatePayToCompanyAndPayToVendor();

    return leadValue.totalAmount - leadValue.balanceAmount;
  }

  calculatePayToCompanyAndPayToVendor(): number {
    const leadValue = this.editLeadForm.value;
    const amountValue = leadValue.bookingAmount - leadValue.actualAmount;

    // this.calExtraAmount();
    if (amountValue < 0) {
      leadValue.payToVendor = amountValue;
      this.editLeadForm.patchValue({ payToVendor: amountValue });

      this.payToVendor = this.editLeadForm.value.payToVendor;
    } else if (amountValue >= 0) {
      leadValue.payToCompany = amountValue;
      this.editLeadForm.patchValue({ payToCompany: amountValue });
      this.payToCompany = this.editLeadForm.value.payToCompany;
    }
    return amountValue;
  }

  // ----------------------------------------------Calculation for Activities Start----------------------------------------------------------------
  calculateTotalAmountOfActivites() {
    const leadValue = this.editLeadForm.value;

    const quantity = Number(leadValue.quantity) || 0;
    const kidQuantity = Number(leadValue.kidQuantity) || 0;
    const companyRate = Number(leadValue.companyRate) || 0;
    const companyRateForKids = Number(leadValue.companyRateForKids) || 0;

    if (quantity >= 0 && kidQuantity >= 0) {
      const firstValue = companyRate * quantity;
      const secondValue = companyRateForKids * kidQuantity;
      const totalAmount = firstValue + secondValue;

      this.editLeadForm.patchValue({ totalAmount });

      // Call booking amount calculation after total amount is updated
      this.calculateBalanceAmountOfActivites();
    } else {
      console.error('Invalid input values.');
      this.editLeadForm.patchValue({ totalAmount: 0 });
    }
  }

  calculateBalanceAmountOfActivites(): number {
    const leadValue = this.editLeadForm.value;

    const quantity = Number(leadValue.quantity) || 0;
    const kidQuantity = Number(leadValue.kidQuantity) || 0;
    const vendorRate = Number(leadValue.vendorRate) || 0;
    const vendorRateForKids = Number(leadValue.vendorRateForKids) || 0;

    if (quantity >= 0 && kidQuantity >= 0) {
      const firstValue = vendorRate * quantity;
      const secondValue = vendorRateForKids * kidQuantity;
      const balanceAmount = firstValue + secondValue;

      this.editLeadForm.patchValue({ balanceAmount });

      // Call booking amount calculation after balance amount is updated
      this.calculateBookingAmountOfActivites();
    } else {
      console.error('Invalid input values.');
      this.editLeadForm.patchValue({ balanceAmount: 0 });
    }

    return 0;
  }

  calculateBookingAmountOfActivites(): number {
    const leadValue = this.editLeadForm.value;

    const totalAmount = Number(leadValue.totalAmount) || 0;
    const balanceAmount = Number(leadValue.balanceAmount) || 0;
    const bookingAmount = totalAmount - balanceAmount;

    this.editLeadForm.patchValue({ bookingAmount });

    return bookingAmount;
  }

  // ----------------------------------------------Calculation for Activities End----------------------------------------------------------------

  checkCategoryType(categoryType: any) {
    if (categoryType.categoryTypeName === Constant.ACTIVITY) {
      this.isActivities = true;
    } else {
      this.isActivities = false;
    }
  }

  onSelectionChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    // this.selectedOption = inputElement.value;
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

  saveLeadData(rawData: any) {
    this.leadDetails = {
      categoryType: rawData?.categoryTypeName,
      superCategory: rawData?.superCategory,
      category: rawData?.category,
      subCategory: rawData?.subCategory,
      pickupDateTime: this.setDateTime(rawData?.pickupDateTime),
      pickupLocation: rawData?.pickupLocation,
      pickupPoint: rawData?.pickupPoint,
      dropDateTime: this.setDateTime(rawData?.dropDateTime),
      // dropDateTime: this.datePipe.transform(rawData?.dropDateTime, 'yyyy-MM-ddTHH:mm');
      dropLocation: rawData?.dropLocation,
      dropPoint: rawData?.dropPoint,
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
      status: rawData?.status,
      leadOrigine: rawData?.leadOrigine,
      leadType: rawData?.leadType,
      createdBy: rawData?.createdBy,
      notes: rawData?.notes,
      records: rawData?.records,
      remarks: rawData?.remarks,
      reminderDate: rawData?.reminderDate,
    };

    this.getCategoryType();

    const superCategory = this.categoryTypeList.find(item => item.categoryTypeName === this.leadDetails.categoryType);
    this.getSuperCategory(superCategory.id);
    this.allIds.superCategoryId = superCategory.id;

   // const category = this.superCategoryList.find(item => item.superCategory === this.leadDetails.superCategory);
  //  alert("superCategory "+this.leadDetails.superCategory +"category id "+this.superCategoryList);
    //this.getCategory(category.id)
          

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
// alert("getCategoryType ");
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(JSON.stringify(response.listPayload));
          this.filteredCategoryTypeList = this.categoryTypeList;

    // const superCategory = this.categoryTypeList.find(item => item.categoryTypeName === this.leadDetails.categoryType);
    // this.getSuperCategory(superCategory.id);
    // this.allIds.categoryTypeId = superCategory.id
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
    // alert("getSuperCategory :"+superCateId);
    this.categoriesManagementService.getSuperCategoryListByCategoryTypeId(superCateId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));

            this.filteredSuperCategoryList = this.superCategoryList;

            const category = this.superCategoryList.find(item => item.superCategory === this.leadDetails.superCategory);
            this.getCategory(category.id)
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
            this.categoryList = JSON.parse( JSON.stringify(response.listPayload));
            this.filteredCategoryList = this.categoryList;

            const subCategory = this.categoryList.find(item => item.category === this.leadDetails.category);
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

  public getSubCategory(subCategoryId: any) {
    console.log("Sub category : "+subCategoryId);
    this.categoriesManagementService.getSubCategoryList()
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.subCategoryList = JSON.parse(JSON.stringify(response.listPayload));
            this.subCategoryList.forEach(subCategory => {
              console.log(subCategory); // Access each item
              // You can perform actions on each subCategory here
            });
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
}

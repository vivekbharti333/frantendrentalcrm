import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SidebarService, routes } from 'src/app/core/core.index'; // Ensure correct import path
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { LeadManagementService } from '../../lead-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { SpinnerService } from 'src/app/core/core.index';
import { CategoriesManagementService } from 'src/app/core-component/categories-management/categories-management.service';
import { UserManagementService } from 'src/app/core-component/user-management/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { CalendarModule } from 'primeng/calendar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

interface data {
  id: number;
  name: string;
}

interface timeData {
  value: string;
  name: string;
}

interface su {
  id: number;
  name: string;
}

interface listData {
  value: string;
  name: string;
}

@Component({
  selector: 'app-create-lead',
  templateUrl: './create-lead.component.html',
  styleUrl: './create-lead.component.scss',
  providers: [MessageService, CalendarModule],
})

export class CreateLeadComponent implements OnInit, AfterViewInit {
  pickupDate: string = '';
  dropoffDate: string = '';
  daysDifference: number = 0;
  pickupError: string = '';
  dropoffError: string = '';

  startTime: string = '10:00';
  endTime: string = '18:00';

  public loginUser: any;

  public addLeadForm!: FormGroup;

  public selectedOption: string = 'vehicle';
  public notesType: string = 'Notes';
  public categoryTypeList: any[] = [];
  public superCategoryList: any[] = [];
  public categoryList: any[] = [];
  public subCategoryList: any[] = [];
  public pickLocationList: any[] = [];
  public dropLocationList: any[] = [];
  public userList: any[] = [];

  // selectedDateTime: string = '';
  public minDate!: Date;
  public maxDate!: Date;

  public roleType: string = '';
  public fullName: string = '';

  public isActivities: Boolean = false;

  public vendorRate: any;
  public deliveryAmtToVendor: any;
  public payToVendor: any;
  public payToVendorAct: any;
  public payToCompany: any;
  public payToCompanyAct: any;

  public discountType = '₹';
  public currentDate: any;

  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];
  filteredPickLocationList: any[] = [];
  filteredDropLocationList: any[] = [];

  ngAfterViewInit(): void {
    // Helps redraw Material form fields
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }, 0);
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

  roundToPrevious15Minutes(date: Date): Date {
    const newDate = new Date(date);
    const minutes = newDate.getMinutes();
    const remainder = minutes % 15;
    newDate.setMinutes(minutes - remainder);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  }

  formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

  ngOnInit(): void {
    this.initializeComponent();
    this.currentDate = new Date().toISOString().substring(0, 10); // Define ttoday here
  }
  initializeComponent(): void {
    this.getCategory('');
    this.createForms();
    // this.getCategoryType();
    this.getUserList();
    this.getPickLocation();
    this.getDropLocation();
    this.calculateDays();

    this.roleType === 'SUPERADMIN'
      ? (this.addLeadForm.value.createdBy = '')
      : (this.addLeadForm.value.createdBy = this.fullName);

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

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private sidebar: SidebarService,
    private leadManagementService: LeadManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService,
    private cookiesService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    this.roleType = this.cookiesService.get('roleType');
    this.fullName = this.cookiesService.get('firstName') + ' ' + this.cookiesService.get('lastName');
  }

  createForms() {
    this.addLeadForm = this.fb.group({
      activityDate: [this.currentDate],  // <-- fixed comma
      startTime: [],
      endTime: [],
      locationType: ['self'],
      pickDropHub: '',
      activityLocation: '',
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
      countryDialCode: ['+91'],
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
      discountType: ['Amount'],
      discount: 0,
      deliveryAmountToCompany: 0,
      deliveryAmountToVendor: 0,
      status: [''],
      leadOrigine: [''],
      leadType: [''],
      createdBy: [''],
      notes: [''],
      nextFollowupDate: [''],
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

  percentOrAmount() {
    if (this.discountType === '₹') {
      this.discountType = '%';
      this.addLeadForm.patchValue({ discountType: 'Percent' });
    } else if (this.discountType === '%') {
      this.discountType = '₹';
      this.addLeadForm.patchValue({ discountType: 'Amount' });
    }
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


  setDefaultDateTime(): void {
    const currentDate = new Date();

    // Get pickup datetime values
    const pickupYear = currentDate.getFullYear();
    const pickupMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const pickupDay = String(currentDate.getDate()).padStart(2, '0');
    const pickupHours = String(currentDate.getHours()).padStart(2, '0');
    const pickupMinutes = String(currentDate.getMinutes()).padStart(2, '0');

    const pickupDateTime = `${pickupYear}-${pickupMonth}-${pickupDay}T${pickupHours}:${pickupMinutes}`;

    // Create drop datetime (next day at 09:00 AM)
    const dropDate = new Date(currentDate);
    dropDate.setDate(dropDate.getDate() + 1);
    dropDate.setHours(9, 0, 0, 0); // <-- set time to 09:00 AM

    const dropYear = dropDate.getFullYear();
    const dropMonth = String(dropDate.getMonth() + 1).padStart(2, '0');
    const dropDay = String(dropDate.getDate()).padStart(2, '0');
    const dropHours = String(dropDate.getHours()).padStart(2, '0');
    const dropMinutes = String(dropDate.getMinutes()).padStart(2, '0');

    const dropDateTime = `${dropYear}-${dropMonth}-${dropDay}T${dropHours}:${dropMinutes}`;

    // Calculate difference in days
    const timeDiff = dropDate.getTime() - currentDate.getTime();
    const noOfdays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Patch the values into the form
    this.addLeadForm.patchValue({
      pickupDateTime: pickupDateTime,
      dropDateTime: dropDateTime,
      totalDays: noOfdays
    });
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

      console.log({
        pickupDateTime: this.formatDateTime(pickDate),
        dropDateTime: this.formatDateTime(dropDate),
        totalDays: noOfDays,
      });

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

  roundToNearest15Minutes(date: Date): Date {
    const ms = 1000 * 60 * 15;
    const rounded = Math.round(date.getTime() / ms) * ms;
    return new Date(rounded);
  }

  // formatDateTime(date: Date): string {
  //   const pad = (n: number) => n.toString().padStart(2, '0');
  //   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  // }






  calculatePayToCompanyAndPayToVendor(): number {
    const leadValue = this.addLeadForm.value;
    const amountValue = leadValue.bookingAmount - leadValue.actualAmount;

    return amountValue;
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

  public routes = routes;
  // public selectedValue1 = '';
  // public selectedValue2 = '';
  // public selectedValue3 = '';
  // public selectedValue4 = '';
  // public selectedValue5 = '';
  // public selectedValue6 = '';
  // public selectedValue7 = '';
  // public selectedValue8 = '';
  // public selectedValue9 = '';
  // public selectedValue10 = '';
  // public selectedValue11 = '';

  // selectedList1: data[] = [
  //   { id: 1, name: 'Car' },
  //   { id: 2, name: 'Bike' },
  // ];

  // selectedList2: data[] = [
  //   { id: 1, name: 'Car' },
  //   { id: 2, name: 'Bike' },
  // ];

  // selectedList3: data[] = [
  //   { id: 1, name: 'Car' },
  //   { id: 2, name: 'Bike' },
  // ];

  leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
  leadType: listData[] = Constant.LEAD_TYPE_LIST;
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  submitLeadForm() {
    this.leadManagementService
      .saveLeadDetails(this.addLeadForm.value)
      .subscribe({
        next: (response: any) => {
          alert('response : ' + response.responseCode);
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              this.addLeadForm.reset();
              // this.setDefaultDateTime();
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

  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
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

  public getSubCategory(categoryDetails: any) {

    this.setSecurityAndVendorRate(categoryDetails);
    this.addLeadForm.patchValue({subCategory: categoryDetails.subCategory,});
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

  public getCategory(categoryId: any) {
    const superCatId = categoryId?.id;
    this.categoriesManagementService
      .getCategoryBySuperCatId(superCatId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.categoryList = JSON.parse(JSON.stringify(response.listPayload));
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

  onNotesTypeChange(value: string) {
    this.notesType = value;
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




}

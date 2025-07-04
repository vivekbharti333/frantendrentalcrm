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

  activityDate: string = '2025-05-01';
  startTime: string = '10:00';
  endTime: string = '18:00';
  locationType: string = 'self';

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
  public payToCompany: any;

  public discountType = '₹';

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
  }
  initializeComponent(): void {
    this.getCategory('');
    this.createForms();
    this.getCategoryType();
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
    this.fullName =
      this.cookiesService.get('firstName') +
      ' ' +
      this.cookiesService.get('lastName');

    // this.setDefaultDateTime();
  }

  createForms() {
    this.addLeadForm = this.fb.group({
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

  percentOrAmount() {
    if (this.discountType === '₹') {
      this.discountType = '%';
      this.addLeadForm.patchValue({ discountType: 'Percent' });
    } else if (this.discountType === '%') {
      this.discountType = '₹';
      this.addLeadForm.patchValue({ discountType: 'Amount' });
    }
  }

  calculateTotalAmountAndBalaenceAmontAfterDiscount1() {
    // const addFormValue = this.addLeadForm.value;

    //total amount start
    if (
      this.addLeadForm.value &&
      this.addLeadForm.value.companyRate != null &&
      this.addLeadForm.value.totalDays != null &&
      this.addLeadForm.value.deliveryAmountToCompany != null &&
      this.addLeadForm.value.quantity != null
    ) {
      const firstValue =
        this.addLeadForm.value.companyRate * this.addLeadForm.value.totalDays;
      const secondValue =
        firstValue + Number(this.addLeadForm.value.deliveryAmountToCompany); // Ensure numeric addition

      this.addLeadForm.patchValue({
        totalAmount: secondValue * this.addLeadForm.value.quantity,
      });

      //total amount end

      // booking amount start
      this.addLeadForm.patchValue({
        bookingAmount:
          secondValue * this.addLeadForm.value.quantity -
          this.addLeadForm.value.balanceAmount,
      });
      //bokking amount end
    }

    const discount = this.addLeadForm.value.discount;

    // Ensure discount is not more than the total amount
    const totalAmt = this.addLeadForm.value.totalAmount - discount;
    const balanceAmt = this.addLeadForm.value.balanceAmount;
    const bookingAmt = totalAmt - balanceAmt;

    // Update the form with all new values in one patchValue call
    this.addLeadForm.patchValue({
      totalAmount: totalAmt,
      bookingAmount: bookingAmt,
    });
  }

  calculateTotalAmountAndBalaenceAmontAfterDiscount() {
    //total amount start
    if (
      this.addLeadForm.value &&
      this.addLeadForm.value.companyRate != null &&
      this.addLeadForm.value.totalDays != null &&
      this.addLeadForm.value.deliveryAmountToCompany != null &&
      this.addLeadForm.value.quantity != null
    ) {
      const firstValue =
        this.addLeadForm.value.companyRate * this.addLeadForm.value.totalDays;
      const secondValue =
        firstValue + Number(this.addLeadForm.value.deliveryAmountToCompany); // Ensure numeric addition

      // this.addLeadForm.patchValue({ totalAmount: secondValue * this.addLeadForm.value.quantity });

      //total amount end

      // Ensure discount is not more than the total amount
      const totalAmt = secondValue * this.addLeadForm.value.quantity - this.addLeadForm.value.discount;
      const balanceAmt = this.addLeadForm.value.balanceAmount;
      const bookingAmt = totalAmt - balanceAmt;


      // Update the form with all new values in one patchValue call
      this.addLeadForm.patchValue({
        totalAmount: totalAmt,
        bookingAmount: bookingAmt,
      });
    }
  }

  setSecurityAndVendorRate(event: any) {
    const selectedSubCategory = event.value; // This now holds the full selected object
    const addFormValue = this.addLeadForm.value;

    // add date and time automatic from sub category
    const startTime = selectedSubCategory.startTime;
    const endTime = selectedSubCategory.endTime;

    if (addFormValue.categoryTypeName == Constant.ACTIVITY) {
      this.addTimeToDate(selectedSubCategory.startTime);
    }

    this.addLeadForm.patchValue({
      securityAmount: selectedSubCategory.securityAmount,
    });
    this.addLeadForm.patchValue({ vendorRate: selectedSubCategory.vendorRate });
    this.addLeadForm.patchValue({
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
    this.addLeadForm.patchValue({ pickupDateTime: formattedDate });

    return formattedDate;
  }

  calExtraAmount() {
    const leadValue = this.addLeadForm.value;
    let secondValue = 0;
    if (
      leadValue.vendorRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToVendor != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.vendorRate * leadValue.totalDays;
      secondValue = firstValue + Number(leadValue.deliveryAmountToVendor);
      this.addLeadForm.patchValue({
        balanceAmount: secondValue * leadValue.quantity,
      });
    }

    const bookAmt = this.addLeadForm.value.bookingAmount;
    const actAmt = this.addLeadForm.value.actualAmount;
    const balAmt = this.addLeadForm.value.balanceAmount;

    if (bookAmt >= actAmt) {
      // const extraAmtPlus = actAmt - bookAmt; // Corrected logic
      this.addLeadForm.patchValue({
        balanceAmount: balAmt + (bookAmt - actAmt),
      });
      this.payToVendor = this.addLeadForm.value.balanceAmount;
    } else {
      // const extraAmtMinus = bookAmt - actAmt; // Corrected logic
      this.addLeadForm.patchValue({
        balanceAmount: balAmt - (actAmt - bookAmt),
      });
      this.payToVendor = this.addLeadForm.value.balanceAmount;
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
    this.addLeadForm.patchValue({
      dropDateTime: dateTime,
      pickupDateTime: dateTime,
    });
  }

  // calculateDays() {
  //   const pickupDateTime = this.addLeadForm.value.pickupDateTime;
  //   const dropDateTime = this.addLeadForm.value.dropDateTime;

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

  //     this.addLeadForm.patchValue({ totalDays: noOfDays });
  //   }
  // }

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
    const leadValue = this.addLeadForm.value;
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

      this.addLeadForm.patchValue({
        totalAmount: secondValue * leadValue.quantity,
      });

      this.deliveryAmtToVendor = this.addLeadForm.value.deliveryAmountToVendor;
      this.vendorRate = this.addLeadForm.value.vendorRate;

      // this.calExtraAmount();

      this.calculateBalanceAmount();
      this.calculatePayToCompanyAndPayToVendor();

      this.addLeadForm.patchValue({ actualAmount: 0, discount: 0 });
    } else {
      console.error('Some required fields are missing for total amount calculation.'
      );
      leadValue.totalAmount = 0; // Set a fallback value
    }
    return secondValue * leadValue.quantity;
  }

  calculateBalanceAmount(): number {
    const leadValue = this.addLeadForm.value;
    let secondValue = 0;
    if (
      leadValue.vendorRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToVendor != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.vendorRate * leadValue.totalDays;
      secondValue = firstValue + Number(leadValue.deliveryAmountToVendor);
      this.addLeadForm.patchValue({
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
    const leadValue = this.addLeadForm.value;
    this.addLeadForm.patchValue({
      bookingAmount: leadValue.totalAmount - leadValue.balanceAmount,
    }),
      this.calculatePayToCompanyAndPayToVendor();

    return leadValue.totalAmount - leadValue.balanceAmount;
  }

  calculatePayToCompanyAndPayToVendor(): number {
    const leadValue = this.addLeadForm.value;
    const amountValue = leadValue.bookingAmount - leadValue.actualAmount;

    // this.calExtraAmount();
    if (amountValue < 0) {
      leadValue.payToVendor = amountValue;
      this.addLeadForm.patchValue({ payToVendor: amountValue });

      this.payToVendor = this.addLeadForm.value.payToVendor;
    } else if (amountValue >= 0) {
      leadValue.payToCompany = amountValue;
      this.addLeadForm.patchValue({ payToCompany: amountValue });
      this.payToCompany = this.addLeadForm.value.payToCompany;
    }
    return amountValue;
  }

  // ----------------------------------------------Calculation for Activities Start----------------------------------------------------------------
  calculateTotalAmountOfActivites() {
    const leadValue = this.addLeadForm.value;

    const quantity = Number(leadValue.quantity) || 0;
    const kidQuantity = Number(leadValue.kidQuantity) || 0;
    const companyRate = Number(leadValue.companyRate) || 0;
    const companyRateForKids = Number(leadValue.companyRateForKids) || 0;

    if (quantity >= 0 && kidQuantity >= 0) {
      const firstValue = companyRate * quantity;
      const secondValue = companyRateForKids * kidQuantity;
      const totalAmount = firstValue + secondValue;

      this.addLeadForm.patchValue({ totalAmount });

      // Call booking amount calculation after total amount is updated
      this.calculateBalanceAmountOfActivites();
    } else {
      console.error('Invalid input values.');
      this.addLeadForm.patchValue({ totalAmount: 0 });
    }
  }

  calculateBalanceAmountOfActivites(): number {
    const leadValue = this.addLeadForm.value;

    const quantity = Number(leadValue.quantity) || 0;
    const kidQuantity = Number(leadValue.kidQuantity) || 0;
    const vendorRate = Number(leadValue.vendorRate) || 0;
    const vendorRateForKids = Number(leadValue.vendorRateForKids) || 0;

    if (quantity >= 0 && kidQuantity >= 0) {
      const firstValue = vendorRate * quantity;
      const secondValue = vendorRateForKids * kidQuantity;
      const balanceAmount = firstValue + secondValue;

      this.addLeadForm.patchValue({ balanceAmount });

      // Call booking amount calculation after balance amount is updated
      this.calculateBookingAmountOfActivites();
    } else {
      console.error('Invalid input values.');
      this.addLeadForm.patchValue({ balanceAmount: 0 });
    }

    return 0;
  }

  calculateBookingAmountOfActivites(): number {
    const leadValue = this.addLeadForm.value;

    const totalAmount = Number(leadValue.totalAmount) || 0;
    const balanceAmount = Number(leadValue.balanceAmount) || 0;
    const bookingAmount = totalAmount - balanceAmount;

    this.addLeadForm.patchValue({ bookingAmount });

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
    this.selectedOption = inputElement.value;
    this.initializeComponent();
  }

  public routes = routes;
  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';
  public selectedValue4 = '';
  public selectedValue5 = '';
  public selectedValue6 = '';
  public selectedValue7 = '';
  public selectedValue8 = '';
  public selectedValue9 = '';
  public selectedValue10 = '';
  public selectedValue11 = '';

  selectedList1: data[] = [
    { id: 1, name: 'Car' },
    { id: 2, name: 'Bike' },
  ];

  selectedList2: data[] = [
    { id: 1, name: 'Car' },
    { id: 2, name: 'Bike' },
  ];

  selectedList3: data[] = [
    { id: 1, name: 'Car' },
    { id: 2, name: 'Bike' },
  ];

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
    //✅
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
          this.filteredCategoryTypeList = this.categoryTypeList;

          if (this.filteredCategoryTypeList.length > 0) {
            this.addLeadForm.patchValue({
              categoryTypeId: this.filteredCategoryTypeList[1],
            });
          }
          this.getSuperCategory(this.filteredCategoryTypeList[1]);
        }
      },
      error: (error: any) => {
        // ✅ Corrected error function syntax
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        });
      },
    });
  }

  public getSuperCategory(superCateId: any) {
    if (superCateId?.categoryTypeName === Constant.ACTIVITY) {
      this.selectedOption = 'activity';
      this.addLeadForm.patchValue({ categoryTypeName: 'ACTIVITY' });
    }

    this.checkCategoryType(superCateId);
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

            if (this.filteredSuperCategoryList.length > 0) {
              this.addLeadForm.patchValue({
                superCategoryId: this.filteredSuperCategoryList[0], // ✅ Set first item as selected
              });
            }
            this.getCategory(this.filteredSuperCategoryList[0]);
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

            if (this.filteredSubCategoryList.length > 0) {
              this.addLeadForm.patchValue({
                subCategoryId: this.filteredSubCategoryList[0], //
              });
            }
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

  compareSubCategories(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
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
}

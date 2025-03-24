import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
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
export class CreateLeadComponent {
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

  selectedDateTime: string = '';
  public minDate!: Date;
  public maxDate!: Date;

  public roleType: string = '';
  public fullName: string = '';

  public isActivities: Boolean = false;

  public vendorRate: any;
  public deliveryAmtToVendor: any;
  public payToVendor: any;
  public payToCompany: any;

  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];
  filteredPickLocationList: any[] = [];
  filteredDropLocationList: any[] = [];

  ngOnInit() {
    this.createForms();
    // this.setDefaultDateTime();
    this.getCategoryType();
    this.getUserList();
    this.getPickLocation();
    this.getDropLocation();

    this.roleType === 'SUPERADMIN'
      ? (this.addLeadForm.value.createdBy = '')
      : (this.addLeadForm.value.createdBy = this.fullName);

    this.minDate = new Date(); // Set to today's date
    this.minDate.setHours(0, 0, 0, 0); // Ensure time is reset to midnight
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);

    this.setDefaultDateTime();
  }

  constructor(
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
      categoryTypeId: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')]],
      superCategoryId: ['', [Validators.required, Validators.pattern('[A-Za-z ]{3,150}')]],
      categoryId: [''],
      subCategoryId: [''],
      categoryTypeName: [''],
      superCategory: [''],
      category: [''],
      subCategory: [''],
      itemName: [''],
      pickupDateTime: [''],
      // pickupTime: [''],
      pickupLocation: [''],
      pickupPoint: [''],
      dropDateTime: [''],
      // dropTime: [''],
      dropLocation: [''],
      dropPoint: [''],
      customeName: [''],
      countryDialCode: [''],
      customerMobile: [''],
      customerAlternateMobile: [''],
      customerEmailId: [''],
      totalDays: [''],
      // totalDays: 1 as number | null,
      quantity: 1,
      childrenQuantity: [''],
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


  setSecurityAndVendorRate(event: any) {
    const selectedSubCategory = event.value; // This now holds the full selected object
    alert(selectedSubCategory.vendorRateForKids);

    this.addLeadForm.patchValue({ securityAmount: selectedSubCategory.securityAmount });
    this.addLeadForm.patchValue({ vendorRate: selectedSubCategory.vendorRate });
    this.addLeadForm.patchValue({ vendorRateForKids: selectedSubCategory.vendorRateForKids })
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
      this.addLeadForm.patchValue({ balanceAmount: secondValue * leadValue.quantity });
    }

    const bookAmt = this.addLeadForm.value.bookingAmount;
    const actAmt = this.addLeadForm.value.actualAmount;
    const balAmt = this.addLeadForm.value.balanceAmount;

    if (bookAmt >= actAmt) {
      // const extraAmtPlus = actAmt - bookAmt; // Corrected logic
      this.addLeadForm.patchValue({ balanceAmount: (balAmt + (bookAmt - actAmt)) });
      this.payToVendor = this.addLeadForm.value.balanceAmount;
    } else {
      // const extraAmtMinus = bookAmt - actAmt; // Corrected logic
      this.addLeadForm.patchValue({ balanceAmount: balAmt - (actAmt - bookAmt) });
      this.payToVendor = this.addLeadForm.value.balanceAmount;
    }
  }


  setDefaultDateTime(): void {
    const currentDate = new Date();

    // Get the local date and time values
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');  // Months are zero-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    // Combine into the required format: YYYY-MM-DDTHH:MM
    const dateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Patch the value into the form
    this.addLeadForm.patchValue({
      dropDateTime: dateTime,
      pickupDateTime: dateTime
    });
  }

  calculateDays() {
    const pickupDateTime = this.addLeadForm.value.pickupDateTime;
    const dropDateTime = this.addLeadForm.value.dropDateTime;

    if (pickupDateTime && dropDateTime) {
      let pickDate = new Date(pickupDateTime);
      let dropDate = new Date(dropDateTime);

      // Adjust pickup date if time is before 6:00 AM
      if (pickDate.getHours() < 6) {
        pickDate.setDate(pickDate.getDate() - 1);
      }

      // Adjust drop date if time is before 9:00 AM
      if (dropDate.getHours() >= 9) {
        dropDate.setDate(dropDate.getDate() + 1);
      }

      const timeDifference = dropDate.getTime() - pickDate.getTime();
      const noOfDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

      this.addLeadForm.patchValue({ totalDays: noOfDays });
    }
  }


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
      const secondValue = firstValue + Number(leadValue.deliveryAmountToCompany); // Ensure numeric addition

      this.addLeadForm.patchValue({ totalAmount: secondValue * leadValue.quantity });

      this.deliveryAmtToVendor = this.addLeadForm.value.deliveryAmountToVendor;
      this.vendorRate = this.addLeadForm.value.vendorRate;

      this.calculateBalanceAmount();
      this.calculatePayToCompanyAndPayToVendor();
    } else {
      console.error('Some required fields are missing for total amount calculation.');
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
      this.addLeadForm.patchValue({ balanceAmount: secondValue * leadValue.quantity });

      this.calculateBookingAmount();
      this.calculatePayToCompanyAndPayToVendor();
    } else {
      console.error('Some required fields are missing for balance amount calculation.');
      leadValue.balanceAmount = 0; // Set a default fallback value
    }
    return secondValue * leadValue.quantity
  }

  calculateBookingAmount(): number {
    const leadValue = this.addLeadForm.value;
    this.addLeadForm.patchValue({ bookingAmount: leadValue.totalAmount - leadValue.balanceAmount }),
      this.calculatePayToCompanyAndPayToVendor();

    return leadValue.totalAmount - leadValue.balanceAmount;
  }

  calculatePayToCompanyAndPayToVendor(): number {
    const leadValue = this.addLeadForm.value;
    const amountValue = (leadValue.bookingAmount - leadValue.actualAmount);

    // this.calExtraAmount();
    if (amountValue < 0) {
      leadValue.payToVendor = amountValue;
      this.addLeadForm.patchValue({ payToVendor: amountValue })

      this.payToVendor = this.addLeadForm.value.payToVendor;

    } else if (amountValue >= 0) {
      leadValue.payToCompany = amountValue;
      this.addLeadForm.patchValue({ payToCompany: amountValue })
      this.payToCompany = this.addLeadForm.value.payToCompany;
    }
    return amountValue;
  }


  // ----------------------------------------------Calculation for Activities Start----------------------------------------------------------------
  calculateTotalAmountOfActivites() {
    const leadValue = this.addLeadForm.value;

    const quantity = Number(leadValue.quantity) || 0;
    const childrenQuantity = Number(leadValue.childrenQuantity) || 0;
    const companyRate = Number(leadValue.companyRate) || 0;
    const companyRateForKids = Number(leadValue.companyRateForKids) || 0;

    if (quantity >= 0 && childrenQuantity >= 0) {
        const firstValue = companyRate * quantity;
        const secondValue = companyRateForKids * childrenQuantity;
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
    const childrenQuantity = Number(leadValue.childrenQuantity) || 0;
    const vendorRate = Number(leadValue.vendorRate) || 0;
    const vendorRateForKids = Number(leadValue.vendorRateForKids) || 0;

    if (quantity >= 0 && childrenQuantity >= 0) {
        const firstValue = vendorRate * quantity;
        const secondValue = vendorRateForKids * childrenQuantity;
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
    console.log('Selected option:', this.selectedOption);
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

  // submitLeadForm1(){
  //   console.log("Enter ")
  //   console.log("Value : "+this.addLeadForm.value)
  // }

  submitLeadForm() {
    this.leadManagementService.saveLeadDetails(this.addLeadForm.value).subscribe({
      next: (response: any) => {
        alert("response : " + response.responseCode);
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

  public getCategoryType() { //✅
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(JSON.stringify(response.listPayload));
          this.filteredCategoryTypeList = this.categoryTypeList;

          if (this.filteredCategoryTypeList.length > 0) {
            this.addLeadForm.patchValue({
              categoryTypeId: this.filteredCategoryTypeList[1] // ✅ Set first item as selected
            });

          }
          this.getSuperCategory(this.filteredCategoryTypeList[1])
        }
      },
      error: (error: any) => {  // ✅ Corrected error function syntax
        this.messageService.add({
          summary: '500',
          detail: 'Server Error',
          styleClass: 'danger-background-popover',
        });
      }
    });
  }

  public getSuperCategory(superCateId: any) {

    if (superCateId?.categoryTypeName === Constant.ACTIVITY) {
      this.selectedOption = 'activity';
    }

    this.checkCategoryType(superCateId);
    const categoryId = superCateId?.id;
    console.log("Enter Hai : " + categoryId);
    this.categoriesManagementService.getSuperCategoryListByCategoryTypeId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));
            this.filteredSuperCategoryList = this.superCategoryList;

            if (this.filteredSuperCategoryList.length > 0) {
              this.addLeadForm.patchValue({
                superCategoryId: this.filteredSuperCategoryList[0] // ✅ Set first item as selected
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

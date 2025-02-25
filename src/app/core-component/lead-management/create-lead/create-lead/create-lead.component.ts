import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { SidebarService, routes } from 'src/app/core/core.index'; // Ensure correct import path
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { LeadManagementService } from '../../lead-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';
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

  public selectedOption: string = 'lead';
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
  
  public isActivities:Boolean = false;

  filteredCategoryTypeList: any[] = [];
  filteredSuperCategoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSubCategoryList: any[] = [];
  filteredPickLocationList: any[] =[];
  filteredDropLocationList: any[] =[];

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
    pickupLocation: [''],
    pickupPoint: [''],
    dropDateTime: [''],
    dropLocation: [''],
    dropPoint: [''],
    customeName: [''],
    countryDialCode: [''],
    customerMobile: [''],
    customerAlternateMobile: [''],
    customerEmailId: [''],
    totalDays: 1 as number | null,
    quantity: 1,
    childrenQuantity: [''],
    infantQuantity: [''],
    vendorRate: 0,
    payToVendor: 0,
    companyRate: 0,
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



  calculateDays() {
    const leadValue = this.addLeadForm.value;
    if (leadValue.dropDateTime && leadValue.pickupDateTime) {
      const d1 = new Date(leadValue.dropDateTime);
      const d2 = new Date(leadValue.pickupDateTime);

      if (d1 < d2) {
        alert('Drop Date & Time must be after Pickup Date & Time.');
        leadValue.totalDays = null;
        return;
      }

      const timeDifference = Math.abs(d1.getTime() - d2.getTime());
      leadValue.totalDays = Math.ceil(timeDifference / (1000 * 3600 * 24));

      this.calculateTotalAmount();
      this.calculatePayToCompanyAndPayToVendor();
    } else {
      leadValue.totalDays = null;
      alert('Please select both Pickup and Drop dates.');
    }
  }

  calculateTotalAmount() {
    const leadValue = this.addLeadForm.value;
    // Check if `lead` and its properties are properly initialized
    if (
      leadValue &&
      leadValue.companyRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToCompany != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.companyRate * leadValue.totalDays;
      const secondValue = firstValue + Number(leadValue.deliveryAmountToCompany); // Ensure numeric addition
      // leadValue.totalAmount = secondValue * leadValue.quantity;

      this.addLeadForm.patchValue({ totalAmount: secondValue * leadValue.quantity});
      
      this.calculateBalanceAmount();
      this.calculatePayToCompanyAndPayToVendor();
    } else {
      console.error('Some required fields are missing for total amount calculation.');
      leadValue.totalAmount = 0; // Set a fallback value
    }
  }

  calculateBalanceAmount() {
    const leadValue = this.addLeadForm.value;
    if (
      leadValue.vendorRate != null &&
      leadValue.totalDays != null &&
      leadValue.deliveryAmountToVendor != null &&
      leadValue.quantity != null
    ) {
      const firstValue = leadValue.vendorRate * leadValue.totalDays;
      const secondValue =  firstValue +  Number(leadValue.deliveryAmountToVendor);
      // leadValue.balanceAmount =  secondValue * leadValue.quantity;
      this.addLeadForm.patchValue({ balanceAmount: secondValue * leadValue.quantity});

        this.calculateBookingAmount();
        this.calculatePayToCompanyAndPayToVendor();
    } else {
      console.error('Some required fields are missing for balance amount calculation.');
      leadValue.balanceAmount = 0; // Set a default fallback value
    }
  }

  calculateBookingAmount(){
    const leadValue = this.addLeadForm.value;
    // leadValue.bookingAmount = (leadValue.totalAmount - leadValue.balanceAmount);

    this.addLeadForm.patchValue({ bookingAmount: leadValue.totalAmount - leadValue.balanceAmount}),
    this.calculatePayToCompanyAndPayToVendor();
  }

  calculatePayToCompanyAndPayToVendor() {
    const leadValue = this.addLeadForm.value;
    const amountValue = (leadValue.bookingAmount - leadValue.actualAmount);

    if (amountValue < 0) {
      leadValue.payToVendor = amountValue;
    } else if (amountValue >= 0)
      leadValue.payToCompany = amountValue;
  }

  checkCategoryType(categoryType: any) {
    console.log(categoryType.categoryTypeName, Constant.ACTIVITY); // For debugging
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

  // leadOrigine: listData[] = [{ value: 'CALL', name: 'Call'}, {value: 'WHATSAPP', name: 'Whats App'}, {value: 'EMAIL', name: 'Email'},{value: 'OTHER', name: 'Other'}];
  leadOrigine: listData[] = Constant.LEAD_ORIGINE_LIST;
  leadType: listData[] = Constant.LEAD_TYPE_LIST;
  leadStatus: listData[] = Constant.LEAD_STATUS_LIST;

  submitLeadForm1(){
    console.log("Enter ")
    console.log("Value : "+this.addLeadForm.value)
  }

  submitLeadForm() {
    this.leadManagementService.saveLeadDetails(this.addLeadForm.value).subscribe({
      next: (response: any) => {
        alert("response : "+response.responseCode);
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
    
    this.checkCategoryType(superCateId);
    const categoryId = superCateId?.id;
    console.log("Enter Hai : "+categoryId);
    this.categoriesManagementService.getSuperCategoryListByCategoryTypeId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));
            this.filteredSuperCategoryList = this.superCategoryList;

            if(this.filteredSuperCategoryList.length > 0){
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

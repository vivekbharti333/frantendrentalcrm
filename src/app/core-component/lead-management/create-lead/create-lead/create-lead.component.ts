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
  providers: [MessageService, ToastModule],
})
export class CreateLeadComponent {
  public loginUser: any;
  public selectedOption: string = 'lead';
  public categoryTypeList: any[] = [];
  public superCategoryList: any[] = [];
  public categoryList: any[] = [];
  public subCategoryList: any[] = [];
  public userList: any[] = [];

  constructor(
    private sidebar: SidebarService,
    private leadManagementService: LeadManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private categoriesManagementService: CategoriesManagementService,
    private userManagementService: UserManagementService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    this.getCategoryType();
    this.getUserList();
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

  public lead = {
    // bookingId: '',
    companyName: 'Notes',
    enquirySource: 'Call',
    categoryTypeId: '',
    superCategoryId: '',
    categoryId: '',
    subCategoryId: '',

    categoryTypeName: '', // Need to add in payload
    superCategory: '', //
    category: '', //
    subCategory: '', //
    itemName: '',
    pickupDateTime: '',
    pickupLocation: '',
    pickupPoint: '',
    dropDateTime: '',
    dropLocation: '',
    dropPoint: '',
    customeName: '',
    countryDialCode: '',
    customerMobile: '',
    customerAlternateMobile: '',
    customerEmailId: '',
    totalDays: '',
    quantity: '',
    vendorRate: '',
    payToVendor: '',
    companyRate: '',
    payToCompany: '',
    bookingAmount: '',
    balanceAmount: '',
    totalAmount: '',
    securityAmount: '',
    deliveryAmountToCompany: '',
    deliveryAmountToVendor: '',
    // vendorName: '',
    status: '',
    leadOrigine: '',
    leadType: '',
    createdBy: '',
    notes: '',
    followupDateTime: '',
    remarks: '',
    preValue: `    Reports : 
    Delivery : 
    Comments : 
    Pay to vendor : 
    Pay to company :`,
    reminderDate: '',
    records: '',
  };

  submitLeadForm(form: NgForm) {
    alert(this.lead.categoryTypeId);
    alert(this.lead.categoryTypeName);
    this.leadManagementService.saveLeadDetails(this.lead).subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          if (response['payload']['respCode'] == '200') {
            form.reset();
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

  public getCategoryType() {
    this.categoriesManagementService.getCategoryTypeList().subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
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
    console.log("categoryyyyy++++++", superCateId)
    const categoryId = superCateId?.id;
    this.categoriesManagementService
      .getSuperCategoryListByCategoryTypeId(categoryId)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            this.superCategoryList = JSON.parse(
              JSON.stringify(response.listPayload)
            );
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
          this.userList = JSON.parse(
            JSON.stringify(response.listPayload)
          );
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
}

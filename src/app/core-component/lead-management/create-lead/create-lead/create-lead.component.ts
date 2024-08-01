import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { SidebarService, routes } from 'src/app/core/core.index'; // Ensure correct import path
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { LeadManagementService } from '../../lead-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';
import { SpinnerService } from 'src/app/core/core.index';

interface data {
  id: number;
  name: string;
}

interface su {
  id: number;
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
  public categoryTypeList: any[]=[];
  public superCategoryList: any[]=[];
  public categoryList : any[]=[];
  public subCategoryList : any[]=[];

  constructor(
    private sidebar: SidebarService,
    private leadManagementService: LeadManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
   
  }

  ngOnInit(){
    this.getCategoryType();
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
    {id:1, name: 'Car' },
    {id:2, name: 'Bike' }
  ];

  selectedList2: data[] = [
    {id:1, name: 'Car' },
    {id:2, name: 'Bike' }
  ];
  
  selectedList3: data[] = [
    {id:1, name: 'Car' },
    {id:2, name: 'Bike' }
  ];
  

  public lead = {
    // bookingId: '',
    companyName: 'Notes',
    enquirySource: 'Call',
    categoryTypeName: '',
    superCategory: '',
    category: '',
    subCategory: '',
    itemName: '',
    pickupDateTime: '',
    pickupLocation: '',
    dropDateTime: '',
    dropLocation: '',
    customeName: '',
    countryDialCode: '',
    customerMobile: '',
    customerAlternateMobile: '',
    customerEmailId: '',
    quantity: '',
    vendorAmount: '',
    sellAmount: '',
    bookingAmount: '',
    balanceAmount: '',
    totalAmount: '',
    securityAmount: '',
    amountToCompany: '',
    amountToVendor: '',
    deliveryAmountToCompany: '',
    deliveryAmountToVendor: '',
    // vendorName: '',
    status: '',
    leadType: '',
    createdBy: '',
    notes: '',
    followupDateTime: '',
    preValue: `    Reports : 
    Delivery : 
    Comments : 
    Pay to vendor : 
    Pay to company :` ,
    reminderDate: '',
    records: ''
  };

  submitLeadForm(form: NgForm) {
    alert("Company Name :"+this.lead.companyName);
    alert("Enquiry Source : "+this.lead.pickupDateTime);
    this.leadManagementService.saveLeadDetails(this.lead)
      .subscribe({
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
        error: () => this.messageService.add({
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
  
    this.leadManagementService.getCategoryTypeList()
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryTypeList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  public getSuperCategory(superCateId:any) {
    alert("jhf : "+superCateId);
    this.leadManagementService.getSuperCategoryList(superCateId)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.superCategoryList = JSON.parse(JSON.stringify(response.listPayload));
          alert("jhf : "+this.superCategoryList);
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  public getCategory(categoryId: any) {

    this.leadManagementService.getCategoryList(categoryId)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.categoryList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }

  public getSubCategory(subCategoryId: any) {
    this.leadManagementService.getSubCategoryList(subCategoryId)
    .subscribe({
      next: (response: any) => {
        if (response['responseCode'] == '200') {
          this.subCategoryList = JSON.parse(JSON.stringify(response.listPayload));
        }
      },
      error: (error: any) => this.messageService.add({
        summary: '500',
        detail: 'Server Error',
        styleClass: 'danger-background-popover',
      })
    });
  }
  
}

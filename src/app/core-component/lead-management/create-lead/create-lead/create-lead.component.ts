import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { SidebarService } from 'src/app/core/core.index'; // Ensure correct import path
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { LeadManagementService } from '../../lead-management.service';
import { Constant } from 'src/app/core/constant/constants';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-create-lead',
  templateUrl: './create-lead.component.html',
  styleUrl: './create-lead.component.scss',
  providers: [MessageService, ToastModule],
})
export class CreateLeadComponent {

  public loginUser: any;
  public selectedOption: string = 'lead'; 

  constructor(
    private sidebar: SidebarService,
    private leadManagementService: LeadManagementService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  onSelectionChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedOption = inputElement.value;
    console.log('Selected option:', this.selectedOption);
  }
  

  public lead = {
    // bookingId: '',
    companyName: 'Notes',
    enquirySource: 'Call',
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
    // vendorName: '',
    status: '',
    createdBy: '',
    notes: '',
    preValue: `    Reports :
    Delivery :
    Comments :
    Pay to vendor :
    Pay to company :`,
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
  
}

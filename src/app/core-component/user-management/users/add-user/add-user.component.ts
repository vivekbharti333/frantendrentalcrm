import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { SidebarService } from 'src/app/core/core.index'; // Ensure correct import path
import { UserManagementService } from '../../user-management.service';
import { MessageService } from 'primeng/api';
import { routes } from 'src/app/core/helpers/routes';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';


interface Address {
  addressType: string;
  addressLine: string;
  landmark: string;
  district: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface data {
  value: string;
  name: string;
}

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule,MatOptionModule,MatCheckboxModule, MatFormFieldModule], // Add FormsModule here
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  providers: [MessageService],
})
export class AddUserComponent {

  // permissionsList: string[] = ['admindb', 'admindbn', 'usermang', 'usermang1'];
  selectedOptions: string[] = [];


  permission12: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  

  public routes = routes;

  public user = {
    userPicture: '',
    firstName: '',
    lastName: '',
    emailId: '',
    gender: '',
    permissions: '',
	  roleType: '',
	  mobileNo: '',
	  alternateMobile: '',
    userCode: '',
	  idDocumentType: '',
	  idDocumentPicture: '',
	  panNumber: '',
    dob:'',
    emergencyContactRelation1: '',
    emergencyContactName1: '',
    emergencyContactNo1: '',
    emergencyContactRelation2: '',
    emergencyContactName2: '',
    emergencyContactNo2: '',
    // addressList: [
    //   this.createAddress(),
    //   this.createAddress()
    // ]
    addressList: [
      { addressType: 'CURRENT', addressLine: '', landmark: '', district: '', city: '', state: '', country: 'INDIA', pincode: '' },
      { addressType: 'PARMANENT', addressLine: '', landmark: '', district: '', city: '', state: '', country: 'INDIA', pincode: '' }
    ]
    // addressList: [
    //   this.createAddress('CURRENT'),
    //   this.createAddress('PERMANENT')
    // ]
  };





  constructor(
    private sidebar: SidebarService,
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    // private toastr: ToastrService
  ) {

  }

  
  private createAddress(addressType: string): Address {
    return {
      addressType: addressType,
      addressLine: '',
      landmark: '',
      district: '',
      city: '',
      state: '',
      country: 'INDIA',
      pincode: ''
    };
  }

  myFunction() {
    // alert('Hello, world!');
  }
  public copyCurrentToPermanent() {
    // const currentAddress = this.user.addressList.find(address => address.addressType === 'CURRENT');
    // const permanentAddress = this.user.addressList.find(address => address.addressType === 'PERMANENT');

    // if (currentAddress && permanentAddress) {
    //   permanentAddress.addressLine = currentAddress.addressLine;
    //   permanentAddress.landmark = currentAddress.landmark;
    //   permanentAddress.district = currentAddress.district;
    //   permanentAddress.city = currentAddress.city;
    //   permanentAddress.state = currentAddress.state;
    //   permanentAddress.country = currentAddress.country;
    //   permanentAddress.pincode = currentAddress.pincode;
    // }
  }

  

  public selectedValue2 = '';
  public selectedValue3 = '';
  public selectedValue4 = '';
  public selectedValue5 = '';
  public selectedValue6 = '';
  public selectedValue7 = '';
  public password : boolean[] = [false];

  genderType: data[] = [{ value: '1', name: 'MALE'}, {value: '2', name: 'FEMALE'}, {value: '3', name: 'OTHER'}];
  userType: data[] = [{ value: '1', name: 'ADMIN'}, {value: '2', name: 'TEAM LEADER'}, {value: '3', name: 'SALE EXECUTIVE'}];
  // permissionsList: data[] = [{ value: '1', name: 'admindb'}, {value: '2', name: 'admindbn'}, {value: '3', name: 'usermang'},{value: '3', name: 'usermang1'}];
  // permissionsList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  permissionsList: string[] = ['admindb', 'admindbn', 'usermang', 'usermang1'];

  // selectedList2: data[] = [{ value: 'United Kingdom' }, { value: 'India' }];
  // selectedList3: data[] = [{ value: 'Choose' },{value: 'Regular' }];
  // selectedList4: data[] = [
  //   { value: 'UI/UX' },
  //   { value: 'Support' },
  //   { value: 'HR' },
  //   { value: 'Engineering' },
  // ];
  // selectedList5: data[] = [
  //   { value: 'Designer' },
  //   { value: 'Developer' },
  //   { value: 'Tester' },
  // ];
  // selectedList6: data[] = [
  //   { value: 'O positive' },
  //   { value: 'A positive' },
  //   { value: 'B positive' },
  // ];
  // selectedList7: data[] = [{ value: 'United Kingdom' }, { value: 'USA' }];

  // public roleTypes = [
  //   { id: 1, name: 'Admin' },
  //   { id: 2, name: 'User' },
  //   { id: 3, name: 'Guest' }
  // ];


  submitUserForm12(form: NgForm) {
    if (form.valid) {
      this.userManagementService.saveUserDetails(this.user).subscribe(
        response => {
          console.log("User details saved successfully", response);
          // Handle success response
        },
        error => {
          console.error("Error saving user details", error);
          // Handle error response
        }
      );
    } else {
      console.log('Form is invalid');
    }
  }

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result.split(',')[1]; // Get the base64 part

        // Set the base64 string to the userPicture field
        this.user.userPicture = "data:image/jpeg;base64,"+base64String;
        alert("base64 : "+this.user.userPicture);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  submitUserForm() {
    // this.isLoading = true;
    alert(this.user.userPicture);
    // alert(form);
    // alert(form.value);
    
    this.userManagementService.saveUserDetails(this.user)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] == '200') {
            if (response['payload']['respCode'] == '200') {
              alert(response['payload']['respMesg']);
              //  this.toastr.success(response['payload']['respMesg'], response['payload']['respCode']);
             // form.reset();
              // this.createForms();
              // this.isLoading = false;
            } else {
              alert(response['payload']['respMesg']);
              // this.toastr.error(response['payload']['respMesg'], response['payload']['respCode']);
              // this.isLoading = false;
            }
          } else {
            // this.toastr.error(response['responseMessage'], response['responseCode']);
            // this.isLoading = false;
          }
        },
        // error: (error: any) => this.toastr.error('Server Error', '500'),
      });
      // this.isLoading = false;
  }


  isCollapsed: boolean = false;

  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }

}
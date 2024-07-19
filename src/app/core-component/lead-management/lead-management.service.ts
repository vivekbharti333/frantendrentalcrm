import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';
import { CookieService } from 'ngx-cookie-service';
// import { UserDetails, UserDetailsRequest } from '../interface/user-management';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LeadManagementService {

  public loginUser;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authenticationService: AuthenticationService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
    // this.loginUser = JSON.parse(this.cookieService.get('loginDetails'))
  }


  saveLeadDetails(lead: any): Observable<any> {
    let request: any = {
      payload: {
        companyName: lead.companyName,
        enquirySource: lead.enquirySource,
        category: lead.category,
        subCategory: lead.subCategory,
        itemName: lead.itemName,
        pickupDateTime: lead.pickupDateTime,
        pickupLocation: lead.pickupLocation,
        dropDateTime: lead.dropDateTime,
        dropLocation: lead.dropLocation,
        customeName: lead.customeName,
        countryDialCode: lead.countryDialCode,
        customerMobile: lead.customerMobile,
        customerEmailId: lead.customerEmailId,
        quantity: lead.quantity,
        vendorAmount: lead.vendorAmount,
        sellAmount: lead.sellAmount,
        bookingAmount: lead.bookingAmount,
        balanceAmount: lead.balanceAmount,
        totalAmount: lead.totalAmount,
        securityAmount: lead.securityAmount,
        // vendorName: lead.,
        status: lead.status,
        createdBy: lead.createdBy,
        notes: lead.notes,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        // createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "registerLead", request);
  }

  getFollowupOneList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getFollowupOne",request);
  }
}

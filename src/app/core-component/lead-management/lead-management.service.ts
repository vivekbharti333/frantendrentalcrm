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

  getCategoryTypeList(): Observable<any> {
    let request: any = {
      payload: {
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getCategoryType",request);
  }

  getSuperCategoryList(categoryTypeId: any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId: categoryTypeId,
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getSuperCategoryDetailsByCategoryTypeId",request);
  }

  getCategoryList(superCategoryId:any): Observable<any> {
    let request: any = {
      payload: {
        superCategoryId: superCategoryId,
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getCategoryDetailsBySuperCategoryId",request);
  }

  getSubCategoryList(categoryId:any): Observable<any> {
    let request: any = {
      payload: {
        categoryId: categoryId,
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getSubCategoryDetailsByCategoryId",request);
  }



  saveLeadDetails(lead: any): Observable<any> {
    let request: any = {
      payload: {
        companyName: lead.companyName,
        enquirySource: lead.enquirySource,
        // superCategory: lead.superCategory,
        // category: lead.category,
        // subCategory: lead.subCategory,
        categoryTypeId: lead.categoryTypeId,
        superCategoryId: lead.superCategoryId,
        categoryId: lead.categoryId,
        subCategoryId: lead.subCategoryId,
        // itemName: lead.itemName,
        pickupDateTime: lead.pickupDateTime,
        pickupLocation: lead.pickupLocation,
        dropDateTime: lead.dropDateTime,
        dropLocation: lead.dropLocation,
        customeName: lead.customeName,
        countryDialCode: lead.countryDialCode,
        customerMobile: lead.customerMobile,
        customerEmailId: lead.customerEmailId,
        totalDays: lead.totalDays,
        quantity: lead.quantity,
        vendorRate: lead.vendorRate,
        payToVendor: lead.payToVendor,
        companyRate: lead.companyRate,
        payToCompany: lead.payToCompany,
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

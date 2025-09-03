import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class BookingManagementService {

  public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  getPickUpList(requestFor: any): Observable<any> {
      const request: any = {
        payload: {
          requestedFor: requestFor,
          roleType: "SUPERADMIN",
          token: this.cookieService.get('token'),
          createdBy: this.cookieService.get('loginId'),
          adminId: this.cookieService.get('adminId'),
          superadminId: this.cookieService.get('superadminId'),
        },
      };
      return this.http.post<any>(Constant.Site_Url + 'getPickupLeadList', request);
    }

    getPickUpListByDateSearch(searchForm: any): Observable<any> {
      const request: any = {
        payload: {
          requestedFor: "CUSTOME",
          roleType: "SUPERADMIN",
          firstDate: searchForm.firstDate,
          lastDate: searchForm.lastDate,
          token: this.cookieService.get('token'),
          createdBy: this.cookieService.get('loginId'),
          adminId: this.cookieService.get('adminId'),
          superadminId: this.cookieService.get('superadminId'),
        },
      };
      return this.http.post<any>(Constant.Site_Url + 'getPickupLeadList', request);
    }

    getDropList(requestFor: any): Observable<any> {
      const request: any = {
        payload: {
          requestedFor: requestFor,
          roleType: "SUPERADMIN",
          token: this.cookieService.get('token'),
          createdBy: this.cookieService.get('loginId'),
          adminId: this.cookieService.get('adminId'),
          superadminId: this.cookieService.get('superadminId'),
        },
      };
      return this.http.post<any>(Constant.Site_Url + 'getDropLeadList', request);
    }

    getDropListByDateSearch(searchForm: any): Observable<any> {
      const request: any = {
        payload: {
          requestedFor: "CUSTOME",
          roleType: "SUPERADMIN",
          firstDate: searchForm.firstDate,
          lastDate: searchForm.lastDate,
          token: this.cookieService.get('token'),
          createdBy: this.cookieService.get('loginId'),
          adminId: this.cookieService.get('adminId'),
          superadminId: this.cookieService.get('superadminId'),
        },
      };
      return this.http.post<any>(Constant.Site_Url + 'getDropLeadList', request);
    }
  
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants'; 
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AssignedLeadService {
public loginUser: any;
  public details = false;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }


  geAssignedList(requestFor: any, status: any): Observable<any> {
      const request: any = {
        payload: {
          requestedFor: requestFor,
          status: status,
          roleType: this.loginUser['roleType'],
          token: this.loginUser['token'],
          createdBy: this.loginUser['loginId'],
          adminId: this.loginUser['adminId'],
          superadminId: this.loginUser['superadminId'],
        },
      };
      return this.http.post<any>(Constant.Site_Url + 'getLeadByStatus', request);
    }



    getPickUpListByDateSearch(searchForm: any): Observable<any> {
      const request: any = {
        payload: {
          requestedFor: "CUSTOME",
          firstDate: searchForm.firstDate,
          lastDate: searchForm.lastDate,
          roleType: this.loginUser['roleType'],
          token: this.loginUser['token'],
          createdBy: this.loginUser['loginId'],
          adminId: this.loginUser['adminId'],
          superadminId: this.loginUser['superadminId'],
        },
      };
      return this.http.post<any>(Constant.Site_Url + 'getLeadByStatus', request);
    }

  }
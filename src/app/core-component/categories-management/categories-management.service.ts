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
export class CategoriesManagementService {

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

  getSuperCategoryList(): Observable<any> {
    let request: any = {
      payload: {
        // categoryTypeId: categoryTypeId,
        requestedFor: 'ALL',
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getSuperCategoryDetails",request);
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

}

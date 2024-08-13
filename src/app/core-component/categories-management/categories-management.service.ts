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

  addCategoryType(categoryType:any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeName:categoryType.categoryTypeName,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"addCategoryType",request);
  }

  editCategoryType(categoryType:any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId : categoryType.id,
        categoryTypeName:categoryType.categoryTypeName,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"editCategoryType",request);
  }

  changeCategoryTypeStatus(rowData:any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId : rowData.id,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeCategoryTypeStatus",request);
  }

    getCategoryTypeList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getCategoryType",request);
  }

  addSuperCategory(superCategoryForm:any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId:superCategoryForm.categoryTypeId,
        superCategory: superCategoryForm.superCategory,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"addSuperCategory",request);
  }

  editSuperCategory(superCategoryForm:any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId:superCategoryForm.categoryTypeId,
        superCategoryId: superCategoryForm.superCategoryId,
        superCategory: superCategoryForm.superCategory,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"editSuperCategory",request);
  }

  changeSuperCategoryStatus(rowData:any): Observable<any> {
    let request: any = {
      payload: {
        superCategoryId: rowData[0],
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeSuperCategoryStatus",request);
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

  addCategoryDetails(addCategory:any): Observable<any> {
    let request: any = {
      payload: {
        // categoryTypeId:addCategory.categoryTypeId,
        superCategoryId: addCategory.superCategoryId,
        category: addCategory.category,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"addCategoryDetails",request);
  }


  editCategoryDetails(editCategory:any): Observable<any> {
    let request: any = {
      payload: {
        // categoryTypeId:addCategory.categoryTypeId,
        superCategoryId: editCategory.superCategoryId,
        categoryId:editCategory.categoryId,
        category: editCategory.category,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"editCategoryDetails",request);
  }

  changeCategoryStatus(rowData:any): Observable<any> {
    let request: any = {
      payload: {
        // categoryTypeId:addCategory.categoryTypeId,
        categoryId:rowData[0],
        // category: editCategory.category,
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"changeCategoryStatus",request);
  }


  getCategoryDetailsList(): Observable<any> {
    let request: any = {
      payload: {
        superCategoryId: '',
        roleType:  this.cookieService.get('roleType'),
        token:  this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId:  this.cookieService.get('superadminId'),
      }
    };
    return  this.http.post<any>(Constant.Site_Url+"getCategoryDetails",request);
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

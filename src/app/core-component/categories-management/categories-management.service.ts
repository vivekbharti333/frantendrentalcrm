/* eslint-disable @typescript-eslint/no-explicit-any */
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
  }

  addCategoryType(categoryType: any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeImage: categoryType.categoryTypeImage,
        categoryTypeName: categoryType.categoryTypeName,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addCategoryType", request);
  }

  editCategoryType(categoryType: any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId: categoryType.id,
        categoryTypeName: categoryType.categoryTypeName,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "editCategoryType", request);
  }

  changeCategoryTypeStatus(rowData: any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId: rowData.id,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "changeCategoryTypeStatus", request);
  }

  getCategoryTypeList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCategoryType", request);
  }

  addSuperCategory(superCategoryForm: any): Observable<any> {
    let request: any = {
      payload: {
        superCategoryImage: superCategoryForm.superCategoryImage,
        categoryTypeId: superCategoryForm.categoryTypeId,
        superCategory: superCategoryForm.superCategory,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addSuperCategory", request);
  }

  editSuperCategory(superCategoryForm: any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId: superCategoryForm.categoryTypeId,
        superCategoryId: superCategoryForm.superCategoryId,
        superCategory: superCategoryForm.superCategory,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "editSuperCategory", request);
  }

  changeSuperCategoryStatus(rowData: any): Observable<any> {
    let request: any = {
      payload: {
        superCategoryId: rowData.id,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "changeSuperCategoryStatus", request);
  }

  getSuperCategoryList(): Observable<any> {
    let request: any = {
      payload: {
        // categoryTypeId: categoryTypeId,
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getSuperCategoryDetails", request);
  }

  getSuperCategoryListByCategoryTypeId(cateTypeId: any): Observable<any> {
    let request: any = {
      payload: {
        categoryTypeId: cateTypeId,
        requestedFor: 'BYCATID',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getSuperCategoryDetails", request);
  }

  addCategoryDetails(addCategory: any): Observable<any> {
    let request: any = {
      payload: {
        pickDropHub: addCategory.pickDropHub,
        activityLocation: addCategory.activityLocation,
        categoryImage: addCategory.categoryImage,
        categoryTypeId: addCategory.categoryTypeId['id'],
        superCategoryId: addCategory.superCategoryId,
        category: addCategory.category,
        subCategory: addCategory.subCategory,
        startDate: addCategory.startDate,
        endDate: addCategory.endDate,
        startTime: addCategory.startTime,
        endTime: addCategory.endTime,
        pickupHub: addCategory.pickupHub,
        dropHub: addCategory.dropHub,
        companyRate: addCategory.companyRate,
        companyRateForKids: addCategory.companyRateForKids,
        vendorRate: addCategory.vendorRate,
        vendorRateForKids: addCategory.vendorRateForKids,
        quantity: addCategory.quantity,
        kidQuantity: addCategory.childrenQuantity,
        infantQuantity: addCategory.infantQuantity,
        securityAmount: addCategory.securityAmount,
        description: addCategory.description,

        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addCategoryDetails", request);
  }

  editCategoryDetails(editCategory: any): Observable<any> {
    let request: any = {
      payload: {
       categoryImage: editCategory.categoryImage,
        categoryTypeId: editCategory.categoryTypeId,
        superCategoryId: editCategory.superCategoryId,
        category: editCategory.category,
        subCategory: editCategory.subCategory,
        startDate: editCategory.startDate,
        endDate: editCategory.endDate,
        startTime: editCategory.startTime,
        endTime: editCategory.endTime,
        pickupHub: editCategory.pickupHub,
        dropHub: editCategory.dropHub,
        companyRate: editCategory.companyRate,
        companyRateForKids: editCategory.companyRateForKids,
        vendorRate: editCategory.vendorRate,
        vendorRateForKids: editCategory.vendorRateForKids,
        quantity: editCategory.quantity,
        kidQuantity: editCategory.childrenQuantity,
        infantQuantity: editCategory.infantQuantity,
        securityAmount: editCategory.securityAmount,
        description: editCategory.description,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "editCategoryDetails", request);
  }

  changeCategoryStatus(rowData: any): Observable<any> {
    let request: any = {
      payload: {
        // categoryTypeId:addCategory.categoryTypeId,
        categoryId: rowData.id,
        // category: editCategory.category,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "changeCategoryStatus", request);
  }

  getCategoryDetailsList(): Observable<any> {
    let request: any = {
      payload: {
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCategoryDetails", request);
  }


  getCategoryBySuperCatId(superCatId: any): Observable<any> {
    let request: any = {
      payload: {
        // requestedFor: 'BYCATID',
        requestedFor: 'ALL',
        superCategoryId: superCatId,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getCategoryDetails", request);
  }

  addSubCategoryDetails(addSubCategory: any): Observable<any> {
    const request: any = {
      payload: {
        subCategoryImage: addSubCategory.subCategoryImage,
        categoryTypeId: addSubCategory.categoryTypeId['id'],
        superCategoryId: addSubCategory.superCategoryId,
        categoryId: addSubCategory.categoryId,
        subCategory: addSubCategory.subCategory,
        securityAmount: addSubCategory.securityAmount,
        companyRate: addSubCategory.companyRate,
        companyRateForKids: addSubCategory.companyRateForKids,
        vendorRate: addSubCategory.vendorRate,
        vendorRateForKids: addSubCategory.vendorRateForKids,
        quantity: addSubCategory.quantity,
        childrenQuantity: addSubCategory.childrenQuantity,
        infantQuantity: addSubCategory.infantQuantity,
        startTime: addSubCategory.startTime,
        endTime: addSubCategory.endTime,
        pickupLocation: addSubCategory.pickupLocation,
        dropLocation: addSubCategory.dropLocation,
        description: addSubCategory.description,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "addSubCategoryDetails", request);
  }

  editSubCategoryDetails(editSubCategory: any): Observable<any> {
    const request: any = {
      payload: {
        categoryTypeId: editSubCategory.categoryTypeId,
        superCategoryId: editSubCategory.superCategoryId,
        categoryId: editSubCategory.categoryId,
        subCategory: editSubCategory.subCategory,
        // category: editSubCategory.category,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "editSubCategoryDetails", request);
  }

  changeSubCategoryStatus(rowData: any): Observable<any> {
    let request: any = {
      payload: {
        subCategoryId: rowData.id,
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "changeSubCategoryStatus", request);
  }

  getSubCategoryList(): Observable<any> {
    let request: any = {
      payload: {
        // categoryId: categoryId,
        requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getSubCategoryDetails", request);
  }

  getSubCategoryListByCatId(categoryId: any): Observable<any> {
    console.log("categoryId : "+categoryId)
    let request: any = {
      payload: {
       
        categoryId: categoryId,
        requestedFor: 'BYCATID',
        // requestedFor: 'ALL',
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getSubCategoryDetails", request);
  }
  // getSubCategoryListByCatId1(allIds: any,categoryId: any): Observable<any> {
  //   let request: any = {
  //     payload: {
  //       categoryTypeId: allIds.categoryTypeId,
  //       superCategoryId: allIds.superCategoryId,
  //       categoryId: categoryId,
  //       requestedFor: 'BYCATID',
  //       roleType: this.cookieService.get('roleType'),
  //       token: this.cookieService.get('token'),
  //       createdBy: this.cookieService.get('loginId'),
  //       superadminId: this.cookieService.get('superadminId'),
  //     }
  //   };
  //   return this.http.post<any>(Constant.Site_Url + "getSubCategoryDetails", request);
  // }

  getLocationByType(locType: any): Observable<any> {
    let request: any = {
      payload: {

        requestedFor: 'BYTYPE',
        locationType: locType,
        roleType: this.cookieService.get('roleType'),
        token: this.cookieService.get('token'),
        createdBy: this.cookieService.get('loginId'),
        superadminId: this.cookieService.get('superadminId'),
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getLocationDetails", request);
  }

}

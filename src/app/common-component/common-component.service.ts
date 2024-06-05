import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constant } from 'src/app/core/constant/constants';

@Injectable({
  providedIn: 'root'
})
export class CommonComponentService {

  public loginUser: any;

  constructor(
    private http: HttpClient,
  ) { }

  getApplicaionHeaderDetails(): Observable<any> {
    let request: any = {
      payload: {
        superadminId: 'MAINADMIN',
      }
    };
    return this.http.post<any>(Constant.Site_Url + "getApplicationHeaderDetailsBySuperadminId", request);
  }

}

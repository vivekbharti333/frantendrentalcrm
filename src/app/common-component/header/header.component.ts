import { Component, OnInit , importProvidersFrom } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { CommonService, SidebarService } from 'src/app/core/core.index';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { routes } from 'src/app/core/helpers/routes';
import { CommonComponentService } from '../common-component.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  {
  public routes = routes;
  activePath = '';
  showSearch = false;
  public changeLayout = '1';
  public darkTheme = false;
  public logoPath = '';
  public miniSidebar = false;
  elem = document.documentElement;
  public addClass = false;
  base = '';
  page = '';
  last = '';

  public headerDetails:any;
  public displayLogo: any;

  constructor(
    private Router: Router,
    private common: CommonService,
    private sidebar: SidebarService,
    private webStorage: WebstorgeService,
    private commonComponentService: CommonComponentService
  ) {
    this.activePath = this.Router.url.split('/')[2];
    this.Router.events.subscribe((data: RouterEvent) => {
      if (data instanceof NavigationStart) {
        this.activePath = data.url.split('/')[2];
      }
    });
    this.sidebar.sideBarPosition.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
  }

  ngOnInit(){
    this.getApplicaionHeaderDetails();
    
  }


  public logout(): void {
    this.webStorage.Logout();
  }

  public toggleSidebar(): void {
    this.sidebar.switchSideMenuPosition();
  }

  public togglesMobileSideBar(): void {
    this.sidebar.switchMobileSideBarPosition();
  }

  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sidebar.expandSideBar.next(true);
    } else {
      this.sidebar.expandSideBar.next(false);
    }
  }

  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  public getApplicaionHeaderDetails() {
     this.displayLogo =localStorage.getItem('displayLogo');
    //  alert("Image : "+this.displayLogo)
    // this.commonComponentService.getApplicaionHeaderDetails()
    //   .subscribe({
    //     next: (response: any) => {
    //       if (response['responseCode'] == '200') {
    //         this.headerDetails = JSON.parse(JSON.stringify(response['payload']));
    //         let base = this.headerDetails[''];
    //         console.log("jhhjg"+this.headerDetails);
    //       } else {
    //       }
    //     },
    //     // error: (error: any) => this.toastr.error('Server Error', '500'),
    //   });
  }

 
}

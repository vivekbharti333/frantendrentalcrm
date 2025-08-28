import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  DataService,
  pageSelection,
  apiResultFormat,
  SidebarService,
} from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { users } from 'src/app/shared/model/page.model';
import { PaginationService, tablePageSize } from 'src/app/shared/shared.index';
import { Constant } from 'src/app/core/constant/constants';
import { MatDialog } from '@angular/material/dialog';
import { BookingManagementService } from '../booking-management.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Component({
  selector: 'app-drop',
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.scss',
  providers: [MessageService, ToastModule],
})
export class DropComponent {

  public loginUser: any;
  public fullData: any[] = [];


  // pagination variables
  public routes = routes;
  public tableData: Array<any> = [];
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<any>;
  public searchDataValue = '';
  // pagination variables



  public lastIndex = 0;
  // public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  // public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public totalPages = 0;

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    // private customPaginationComponent: CustomPaginationComponent,
    private router: Router,

    private sidebar: SidebarService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private bookingManagementService: BookingManagementService,
  ) {
    this.loginUser = this.authenticationService.getLoginUser();
  }

  ngOnInit() {
    this.getDropList();
    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  }

  public getDropList(): void {

    this.serialNumberArray = [];

    const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Format dates as YYYY-MM-DD (or any format required by API)
  const formattedToday = today.toISOString().split('T')[0];
  const formattedTomorrow = tomorrow.toISOString().split('T')[0];


    this.bookingManagementService.getDropList(formattedToday,formattedTomorrow).subscribe((apiRes: any) => {
      this.totalData = apiRes.totalNumber;
      this.fullData = apiRes.listPayload; // Store the full dataset

      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url === this.routes.drop) {
          this.pageSize = res.pageSize;

          // Use the full dataset for pagination
          this.prepareTableData(this.fullData, { skip: res.skip, limit: res.skip + res.pageSize });
          this.pageSize = res.pageSize;
        }
      });
    });
  }
  private prepareTableData(apiRes: any[], pageOption: pageSelection): void {
    this.tableData = [];
    this.serialNumberArray = [];

    apiRes.forEach((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        this.tableData.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    // Update the MatTableDataSource
    this.dataSource = new MatTableDataSource<any>(this.tableData);
    // Emit updated pagination data
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray,
    });
    
  }


  public sortData(sort: Sort) {
    const data = this.tableData.slice();
    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }


  public searchData(value: string): void {
    const searchTerm = value.trim().toLowerCase();

    if (searchTerm) {
      // Filter the full dataset based on the search term
      const filteredData = this.fullData.filter((donation: any) =>
        Object.values(donation).some((field) =>
          String(field).toLowerCase().includes(searchTerm)
        )
      );

      this.prepareTableData(filteredData, { skip: 0, limit: this.pageSize });
      this.totalData = filteredData.length; // Update total data count for pagination
    } else {
      // Reset to the full dataset when the search term is cleared
      this.prepareTableData(this.fullData, { skip: 0, limit: this.pageSize });
      this.totalData = this.fullData.length; // Reset the total data count
    }

    // Reset to the first page after a search or clearing search
    this.pagination.calculatePageSize.next({
      totalData: this.totalData,
      pageSize: this.pageSize,
      tableData: this.tableData,
      serialNumberArray: this.serialNumberArray,
    });
  }


  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }



  getBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      default:
        return 'badge-default';
    }
  }
  
}

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

@Component({
  selector: 'app-drop',
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.scss',
  providers: [MessageService, ToastModule],
})
export class DropComponent {

}

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'src/app/services/auth.service';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { IamService } from 'src/app/services/iam.service';
import { MatDialog } from '@angular/material/dialog';
import { CompanyDto } from 'src/app/dtos/company-dto';
import { SingleCompanyDialogComponent } from './dialogs/single-company-dialog/single-company-dialog.component';
@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements AfterViewInit{
	displayedColumns: string[] = [
		'id',
		'companyName',
		'faxNumber',
		'phoneNumber',
		'pib',
		'registryNumber',
		'identificationNumber',
		'activityCode',
		'address',
	];
	dataSource: MatTableDataSource<CompanyDto>;
	selectedRow: CompanyDto | null = null;
	@ViewChild(MatPaginator) paginator: MatPaginator | undefined;
	@ViewChild(MatSort) sort: MatSort | undefined;
	protected readonly validateHorizontalPosition = validateHorizontalPosition;

	constructor(
		private http: HttpClient,
		private authService: AuthService,
		private iamService: IamService,
		public dialog: MatDialog,
	) {
		this.dataSource = new MatTableDataSource();
		this.fetchAllData();
	}

	ngAfterViewInit() {
		if (this.paginator) this.dataSource.paginator = this.paginator;
		if (this.sort) this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	selectRow(row: CompanyDto): void {
		if (this.selectedRow?.id != row.id) {
			this.selectedRow = row;
		}
		this.iamService.getFindCompanyById(this.selectedRow.id).subscribe(Response=>{
			const data=Response;
			const dialogRef = this.dialog.open(SingleCompanyDialogComponent, {
				width: '500px', // Adjust width as needed
				minHeight: '500px',
				data: data
			  });
		});
	}

	fetchAllData(): void {
		this.iamService
			.getFindAllCompanies()
			.pipe(
				map(dataSource => {
					console.log(dataSource);
					this.dataSource.data = dataSource;
					return dataSource;
				}),
				catchError(error => {
					console.error('Error loading data.', error);
					return throwError(() => error);
				}),
			)
			.subscribe();
	}


}

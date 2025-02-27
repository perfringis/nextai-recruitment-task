import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CarService } from '../../services/car.service';
import { VINValidator } from '../../validators/vin.validator';
import { LicensePlateValidator } from '../../validators/license.plate.validator';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'car-create-page',
  imports: [
    CommonModule,
    HeaderComponent,
    InputComponent,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './car-create.page.html',
  styleUrl: './car-create.page.scss',
})
export class CarCreatePage implements OnInit {
  formGroup!: FormGroup;

  constructor(
    private router: Router,
    private carService: CarService,
    private fb: FormBuilder,
    private dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    this.formGroup = this.fb.group({
      vin: [
        '',
        {
          validators: [Validators.required, VINValidator()],
        },
      ],
      brand: [
        '',
        {
          validators: [Validators.required],
        },
      ],
      licensePlate: [
        '',
        {
          validators: [Validators.required, LicensePlateValidator()],
        },
      ],
    });
  }

  public onSubmit(event: Event): void {
    event.preventDefault();

    if (this.formGroup.valid) {
      this.carService.createCar(this.formGroup.value).subscribe(
        () => {
          this.dialogService.openDialog(
            {
              title: 'Success',
              message: 'Car created successfully!',
            },
            () => {
              this.router.navigate(['/car']);
            }
          );
        },
        (error) => {
          this.dialogService.openDialog({
            title: 'Error',
            message: error.error.message,
          });
        }
      );
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  get vin(): FormControl {
    return this.formGroup.get('vin') as FormControl;
  }

  get brand(): FormControl {
    return this.formGroup.get('brand') as FormControl;
  }

  get licensePlate(): FormControl {
    return this.formGroup.get('licensePlate') as FormControl;
  }
}

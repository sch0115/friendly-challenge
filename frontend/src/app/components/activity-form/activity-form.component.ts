import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateActivityDto } from '../../../src/activities/dto/create-activity.dto'; // Adjust path
import { UpdateActivityDto } from '../../../src/activities/dto/update-activity.dto'; // Adjust path
import { Activity } from '../../../src/models/activity.model'; // Adjust path

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './activity-form.component.html',
  styleUrl: './activity-form.component.css'
})
export class ActivityFormComponent implements OnInit, OnChanges {
  @Input() initialData: Activity | null = null; // For editing
  @Output() formSubmit = new EventEmitter<CreateActivityDto | UpdateActivityDto>();
  @Output() onCancel = new EventEmitter<void>();

  activityForm!: FormGroup;
  isLoading = false;
  editMode = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.updateForm(); // Update form if initialData is present
  }

  ngOnChanges(changes: SimpleChanges): void {
      // Update form if initialData changes (e.g., selecting a different activity to edit)
      if (changes['initialData'] && !changes['initialData'].firstChange) {
           this.updateForm();
      }
  }

  private initForm(): void {
     this.activityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      pointValue: [null, [Validators.required, Validators.min(1), Validators.max(10000), Validators.pattern(/^[1-9]\d*$/)]] // Ensure positive integer
    });
  }

  private updateForm(): void {
      if (this.initialData) {
          this.editMode = true;
          this.activityForm.patchValue({
              name: this.initialData.name,
              description: this.initialData.description,
              pointValue: this.initialData.pointValue
          });
      } else {
          this.editMode = false;
          this.activityForm.reset();
      }
  }

  isInvalid(controlName: string): boolean {
    const control = this.activityForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.activityForm.value;

    // If editing, include the ID from initialData (though the API route uses ID from param)
    const dto = this.editMode && this.initialData
                ? { ...formData } as UpdateActivityDto // ID is in the route, not body typically
                : formData as CreateActivityDto;

    console.log('Submitting DTO:', dto);
    this.formSubmit.emit(dto);

    // Parent component should handle resetting loading state after API call
  }

   // Public method to reset loading state from parent
   setLoading(loading: boolean): void {
       this.isLoading = loading;
   }
}

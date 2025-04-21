import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// Explicit top-level imports
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CreateGroupDto } from '../../../../src/groups/dto/create-group.dto'; // Adjust path as needed

// Custom validator for tags
function tagsValidator(maxLengthPerTag: number = 20, maxTags: number = 10): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Optional field
    }
    const tags = (control.value as string).split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    if (tags.length > maxTags) {
      return { maxTags: true };
    }

    for (const tag of tags) {
      if (tag.length > maxLengthPerTag) {
        return { invalidTags: true };
      }
    }

    return null;
  };
}

@Component({
  selector: 'app-group-create-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ], 
  templateUrl: './group-create-form.component.html',
  styleUrl: './group-create-form.component.css'
})
export class GroupCreateFormComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<CreateGroupDto>();

  groupForm!: FormGroup; // Use definite assignment assertion
  isLoading = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      visibility: ['public', [Validators.required]],
      tagsInput: ['', [tagsValidator(20, 10)]], // Input for comma-separated tags
      tags: [[]] // Actual array of tags derived from tagsInput
    });

    // Subscribe to changes in tagsInput to update the tags array
    this.groupForm.get('tagsInput')?.valueChanges.subscribe(value => {
      const tagsArray = (value || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      this.groupForm.get('tags')?.setValue(tagsArray, { emitEvent: false }); // Update tags array without triggering new validation
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.groupForm.get(controlName);
    // Special handling for tags: check tagsInput validator
    if (controlName === 'tags') {
        const tagsInputControl = this.groupForm.get('tagsInput');
        return !!(tagsInputControl && tagsInputControl.invalid && (tagsInputControl.dirty || tagsInputControl.touched));
    }
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched(); // Mark all fields as touched to show errors
      return;
    }

    this.isLoading = true;
    // Exclude tagsInput from the final DTO
    const { tagsInput, ...formData } = this.groupForm.value;
    const dto: CreateGroupDto = formData as CreateGroupDto;

    console.log('Submitting DTO:', dto); // For debugging
    this.formSubmit.emit(dto);

    // TODO: Reset form or handle loading state completion in the parent component
    // For now, just log and keep loading state (parent should reset)
    // this.isLoading = false; // Parent component should handle this after API call
  }
}

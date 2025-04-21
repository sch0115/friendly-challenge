import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitiesService } from '../../services/activities.service'; // Adjust path
import { Activity } from '../../../../src/models/activity.model'; // Adjust path
import { ActivityFormComponent } from '../activity-form/activity-form.component'; // Import form component
import { CreateActivityDto } from '../../../../src/activities/dto/create-activity.dto'; // Adjust path
import { UpdateActivityDto } from '../../../../src/activities/dto/update-activity.dto'; // Adjust path
// Import a Notification/Toast service if you have one
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, ActivityFormComponent], // Import ActivityFormComponent
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.css'
})
export class ActivityListComponent implements OnInit {
  @Input() groupId!: string; // Required input
  @Input() canManageActivities: boolean = false; // Input to control edit/delete buttons

  @ViewChild('activityFormComp') activityFormComp?: ActivityFormComponent;

  activities: Activity[] = [];
  isLoading = false;
  error: string | null = null;

  showEditForm = false;
  selectedActivity: Activity | null = null;

  showDeleteConfirm = false;
  activityToDelete: Activity | null = null;

  constructor(
    private activitiesService: ActivitiesService,
    // private toastr: ToastrService // Inject notification service if using one
    ) { }

  ngOnInit(): void {
    if (this.groupId) {
      this.loadActivities();
    }
  }

  loadActivities(): void {
    this.isLoading = true;
    this.error = null;
    this.activitiesService.getActivitiesByGroup(this.groupId)
      .subscribe({
        next: (data) => {
          this.activities = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load activities.';
          this.isLoading = false;
          // this.toastr.error(this.error);
          console.error(err);
        }
      });
  }

  addActivity(): void {
    this.selectedActivity = null; // Ensure we are creating, not editing
    this.showEditForm = true;
  }

  editActivity(activity: Activity): void {
    this.selectedActivity = activity;
    this.showEditForm = true;
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.selectedActivity = null;
  }

  handleFormSubmit(formData: CreateActivityDto | UpdateActivityDto): void {
    if (!this.activityFormComp) return;
    
    this.activityFormComp.setLoading(true);
    this.error = null;

    const apiCall = this.editMode
      ? this.activitiesService.updateActivity(this.groupId, this.selectedActivity!.id!, formData as UpdateActivityDto)
      : this.activitiesService.createActivity(this.groupId, formData as CreateActivityDto);

    apiCall.subscribe({
      next: (savedActivity) => {
        // this.toastr.success(`Activity ${this.editMode ? 'updated' : 'added'} successfully!`);
        console.log(`Activity ${this.editMode ? 'updated' : 'added'}:`, savedActivity);
        this.showEditForm = false;
        this.selectedActivity = null;
        this.loadActivities(); // Reload the list
        this.activityFormComp?.setLoading(false);
      },
      error: (err) => {
        this.error = err.message || `Failed to ${this.editMode ? 'update' : 'add'} activity.`;
        // this.toastr.error(this.error);
        console.error(err);
         this.activityFormComp?.setLoading(false);
      }
    });
  }

  // --- Delete Logic ---
  confirmDelete(activity: Activity): void {
    this.activityToDelete = activity;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.activityToDelete = null;
  }

  deleteConfirmed(): void {
    if (!this.activityToDelete || !this.activityToDelete.id) return;

    this.isLoading = true; // Use main loading indicator for delete
    this.error = null;
    this.showDeleteConfirm = false;

    this.activitiesService.deleteActivity(this.groupId, this.activityToDelete.id)
      .subscribe({
        next: () => {
          // this.toastr.success('Activity deleted successfully!');
          console.log('Activity deleted:', this.activityToDelete?.id);
          this.activityToDelete = null;
          this.loadActivities(); // Reload list
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to delete activity.';
          // this.toastr.error(this.error);
          console.error(err);
          this.activityToDelete = null;
          this.isLoading = false;
        }
      });
  }

  // Helper to access editMode easily in the template if needed
  get editMode(): boolean {
      return !!this.selectedActivity;
  }
}

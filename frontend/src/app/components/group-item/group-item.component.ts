import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Group } from '../../core/models/group.model'; // Adjust path as needed
import { CommonModule } from '@angular/common'; // Import CommonModule for pipes like titlecase
import { RouterModule, Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-group-item', // Standard selector prefix
  standalone: true,
  imports: [CommonModule, RouterModule], // Import necessary modules
  templateUrl: './group-item.component.html',
  styleUrls: [], // No specific styles needed, relies on daisyUI/Tailwind
  changeDetection: ChangeDetectionStrategy.OnPush // Use OnPush for better performance with inputs
})
export class GroupItemComponent {
  @Input() group!: Group; // Input property to receive group data

  private router = inject(Router); // Inject Router

  constructor() { }

  // Optional: Add methods for component-specific actions if needed later
  viewGroupDetails(groupId: string | undefined): void {
    if (!groupId) {
      console.error('Cannot navigate: Group ID is missing');
      return;
    }
    console.log(`Navigating to group details for ID: ${groupId}`);
    this.router.navigate(['/groups', groupId]); // Implement navigation
  }
} 
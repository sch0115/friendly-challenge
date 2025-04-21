import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  // No specific SCSS needed, relying on daisyUI/Tailwind
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

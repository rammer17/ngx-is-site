import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router: Router = inject(Router);

  navigateToComponents(): void {
    this.router.navigateByUrl('/docs');
  }
}

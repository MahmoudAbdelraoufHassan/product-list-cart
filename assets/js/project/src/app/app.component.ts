import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  users = [
    {
      id: 1,
      name: "Mahmoud",
      age: 23,
      email: "mahmoud@example.com"
    },
    {
      id: 2,
      name: "Sarah",
      age: 30,
      email: "sarah@example.com"
    },
    {
      id: 3,
      name: "Ali",
      age: 27,
      email: "ali@example.com"
    },
    {
      id: 4,
      name: "Laila",
      age: 22,
      email: "laila@example.com"
    }
  ];

  trackById(index: number, user: any): number {
    return user.id;
  }

}

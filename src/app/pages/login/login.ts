import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginDto } from '../../models/dtos/login.dto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  login() {
    if (this.loginForm.invalid) {
      return;
    }
    const loginDto: LoginDto = this.loginForm.getRawValue();
    this.authService.login(loginDto).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/todo']);
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage = 'Неправильний email або пароль';
        } else {
          this.errorMessage = 'Сталася помилка. Спробуйте пізніше.';
        }

        console.error(error);
      },
    });
  }
}

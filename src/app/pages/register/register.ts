import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterDto } from '../../models/dtos/register.dto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  registerForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  register() {
    if (this.registerForm.invalid) {
      return;
    }
    const registerDto: RegisterDto = this.registerForm.getRawValue();
    this.authService.register(registerDto).subscribe((response) => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('name', response.name);
      localStorage.setItem('email', response.email);
      this.router.navigate(['/todo']);
    });
  }
}

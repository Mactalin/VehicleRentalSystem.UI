import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../features/header/header';


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './shell-component.html',
  styleUrls: ['./shell-component.css']
})
export class ShellComponent {}

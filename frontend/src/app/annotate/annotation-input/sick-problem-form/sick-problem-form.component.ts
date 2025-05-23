import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SickProblem } from '../../../types';

@Component({
  selector: 'la-sick-problem-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sick-problem-form.component.html',
  styleUrl: './sick-problem-form.component.scss'
})
export class SickProblemFormComponent {
  @Input({ required: true }) problem!: SickProblem;
}

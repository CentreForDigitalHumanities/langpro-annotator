import { booleanAttribute, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/angular-fontawesome/types';

@Component({
    selector: 'la-icon-button',
    imports: [FontAwesomeModule],
    templateUrl: './icon-button.component.html',
    styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
    public icon = input<IconProp | null>(null);
    public label = input<string | null>(null);
    public buttonTitle = input<string | null>(null);
    public iconPosition = input<'left' | 'right'>('left');
    public size = input<'sm' | 'md' | 'lg'>('md');
    public buttonType = input<'button' | 'submit' | 'reset'>('button');
    public buttonStyle = input<"primary" | "secondary" | "success" | "danger">("primary");
    public disabled = input(false, { transform: booleanAttribute });
    public outline = input(false, { transform: booleanAttribute });
    public fullWidth = input(false, { transform: booleanAttribute });

    public buttonClasses = computed<string>(() => {
        const classes = ["btn", "d-flex", "align-items-center", "justify-content-center"];
        if (this.outline()) {
            classes.push(`btn-outline-${this.buttonStyle()}`);
        } else {
            classes.push(`btn-${this.buttonStyle()}`);
        }

        if (this.size() === 'sm') {
            classes.push('btn-sm');
        } else if (this.size() === 'lg') {
            classes.push('btn-lg');
        }

        if (this.fullWidth()) {
            classes.push('w-100');
        }

        return classes.join(" ");
    });

    public titleId = computed<string | null>(() => {
        const title = this.buttonTitle();
        if (!title) {
            return null;
        }
        return title.replace(/\s+/g, '-').toLowerCase();
    });

}

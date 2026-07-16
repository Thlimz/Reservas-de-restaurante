import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div [style.display]="'grid'" [style.gap]="'10px'"
         [style.gridTemplateColumns]="grid() ? 'repeat(auto-fill,minmax(184px,1fr))' : '1fr'">
      @for (i of rows(); track i) {
        <div class="skeleton" [style.height.px]="height()"></div>
      }
    </div>`,
})
export class SpinnerComponent {
  count = input(3);
  height = input(90);
  grid = input(false);
  protected rows() { return Array.from({ length: this.count() }, (_, i) => i); }
}
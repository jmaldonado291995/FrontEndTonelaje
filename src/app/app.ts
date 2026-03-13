import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorModalComponent } from './components/ui/error-modal/error-modal';
import { LoaderOverlayComponent } from './components/ui/loader-overlay/loader-overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderOverlayComponent, ErrorModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'proyecto-tonelaje';
}

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.html',
//   styleUrl: './app.scss'
// })
// export class App {
//   protected readonly title = signal('proyecto-tonelaje');
// }
   

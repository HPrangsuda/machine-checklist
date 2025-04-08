import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { TemplateComponent } from './layout/template/template.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { DialogService } from 'primeng/dynamicdialog';

import AcmeTheme from './core/theme/acme.theme';
import { providePrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { Menu } from 'primeng/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { JwtInterceptor } from './core/interceptor/intercaptor';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    TemplateComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ButtonModule,
    PopoverModule,
    Menu,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialog,
    ToastModule,
    ZXingScannerModule,
    DialogModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: AcmeTheme,
        options: {
          darkModeSelector: '.acme-dark'
        }
      }
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    MessageService,
    DialogService,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

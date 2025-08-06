import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  ButtonComponent,
  SearchBarComponent,
  UserCardComponent,
  UserFormComponent
} from './components';

import {
  UserListContainerComponent,
} from './containers';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    SearchBarComponent,
    UserCardComponent,
    UserFormComponent,
    UserListContainerComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

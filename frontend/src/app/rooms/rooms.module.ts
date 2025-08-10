import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesModule } from '../messages/messages.module';

import { RoomsRoutingModule } from './rooms-routing.module';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomDetailComponent } from './room-detail/room-detail.component';


@NgModule({
  declarations: [
    RoomListComponent,
    RoomDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MessagesModule,
    RoomsRoutingModule
  ]
})
export class RoomsModule { }

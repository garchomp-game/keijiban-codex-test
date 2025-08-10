import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { RoomManagementComponent } from './room-management/room-management.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { EditRoomComponent } from './edit-room/edit-room.component';


@NgModule({
  declarations: [
    RoomManagementComponent,
    CreateRoomComponent,
    EditRoomComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }

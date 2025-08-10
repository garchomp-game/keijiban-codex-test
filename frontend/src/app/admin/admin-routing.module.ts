import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomManagementComponent } from './room-management/room-management.component';
import { CreateRoomComponent } from './create-room/create-room.component';
import { EditRoomComponent } from './edit-room/edit-room.component';

const routes: Routes = [
  { path: 'rooms', component: RoomManagementComponent },
  { path: 'rooms/create', component: CreateRoomComponent },
  { path: 'rooms/:id/edit', component: EditRoomComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

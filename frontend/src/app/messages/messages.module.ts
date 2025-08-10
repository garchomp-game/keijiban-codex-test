import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessageListComponent } from './message-list/message-list.component';


@NgModule({
  declarations: [
    MessageListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MessagesRoutingModule
  ],
  exports: [MessageListComponent]
})
export class MessagesModule { }

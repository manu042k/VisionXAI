import { StoreModule } from '@ngrx/store';
import { chatReducer } from './+state/chat-messages/message.reducer';

@NgModule({
  imports: [
    // ... other imports
    StoreModule.forRoot({ chat: chatReducer })
  ],
  // ... rest of the module config
})
export class AppModule { } 
import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { Message } from '../../_models/message';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
    @Input() recipientId: number;
    messages: Message[];
    newMessage: any = {};

    constructor(private authService: AuthService, private userService: UserService, private alertify: AlertifyService) { }

    ngOnInit() {
        this.loadMessages();
    }

    loadMessages() {
        //The plus sign in front of the this is to turn that string nameid into an int for comparison below
        const currentUserId = +this.authService.decodedToken.nameid;
        this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
            .pipe(
                tap(messages => {
                    for (let i = 0; i < messages.length; i++) {
                        if (messages[i].isRead === false && messages[i].recipientId === currentUserId) {
                            this.userService.markAsRead(currentUserId, messages[i].id);
                        }
                    }
                })
            )
            .subscribe(messages => {
                this.messages = messages;
            }, error => {
                this.alertify.error(error);
            });
    }

    sendMessage() {
        this.newMessage.recipientId = this.recipientId;
        this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage).subscribe((message: Message) => {
            this.messages.unshift(message);
            this.newMessage.content = '';
        }, error => {
            this.alertify.error(error);
        });
    }

}

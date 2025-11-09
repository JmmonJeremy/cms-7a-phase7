import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
  selector: 'cms-contact-edit',
  standalone: false,
  templateUrl: './contact-edit.html',
  styleUrl: './contact-edit.css'
})
export class ContactEdit implements OnInit {
  originalContact: Contact;
  contact: Contact;
  groupContacts: Contact[] = [];
  editMode: boolean = false;
  groupContactRepeat = false;
  currentContact = false;
  id: string;
  // Added for adding contacts through a drop-down menu - addition
  availableContacts: Contact[] = [];
  selectedContactId: string = '';

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Added for adding contacts through a drop-down menu - addition
    this.availableContacts = this.contactService.getContacts();
    // Regular Assignment Code
    this.route.params.subscribe (
      (params: Params) => {
        this.id = params['id'];
        if (!this.id) {
          this.editMode = false;          
          return;
        }  
        this.originalContact = this.contactService.getContact(this.id);  
        if (!this.originalContact) {          
          return;
        }          
        this.editMode = true;
        this.contact = JSON.parse(JSON.stringify(this.originalContact));         
        if (this.originalContact.group && Array.isArray(this.originalContact.group)) {
          this.groupContacts = JSON.parse(JSON.stringify(this.originalContact.group));
        }
      }
    ) 
    // Added for adding contacts through a drop-down menu - addition
    this.updateAvailableGroupContacts();
  }

  onSubmit(form: NgForm) {
    const value = form.value;    
      this.contact = new Contact(
        'To be added by contactService method updateContact or addContact',
        value.name,
        value.email,
        value.phone,
        value.imageUrl,
        this.groupContacts
      );      
      if (this.editMode) {
        this.contactService.updateContact(this.originalContact, this.contact);        
      } else {
        this.contactService.addContact(this.contact);        
      }
      this.router.navigate(['/contacts']);
  }

  onCancel() {
    this.router.navigate(['/contacts']);
  }

  isInvalidContact(newContact: Contact): boolean {
    if (!newContact) {  
      this.currentContact = false; 
      this.groupContactRepeat = false;       
      return true;
    }
    if (this.contact && newContact.id === this.contact.id) {
      this.groupContactRepeat = false; 
      this.currentContact = true;  
      return true;
    }
    for (let i = 0; i < this.groupContacts.length; i++) {
      if (newContact.id === this.groupContacts[i].id) {
        this.currentContact = false; 
        this.groupContactRepeat = true;         
        return true;
      }
    }
    this.currentContact = false; 
    this.groupContactRepeat = false;   
    return false;
  }
  
  addToGroup(event:  DndDropEvent): void {
    const selectedContact: Contact = event.data;
    const invalidGroupContact = this.isInvalidContact(selectedContact);
    if (invalidGroupContact) {
      return;
    }   
    this.groupContacts.push(selectedContact);
  }

  onRemoveItem(index: number): void {
    if (index < 0 || index >= this.groupContacts.length) {
      return;
    }
    this.currentContact = false; 
    this.groupContactRepeat = false;   
    this.groupContacts.splice(index, 1);
  }

  // All below is added for adding contacts through a drop-down menu - addition
  updateAvailableGroupContacts() {
    // get all contacts and the IDs of the current group members
    const allContacts = this.contactService.getContacts();
    // get the IDs of the current group members
    const groupContactIds = this.groupContacts.map(c => c.id);
    // filter out contacts already in the group or the contact being edited
    this.availableContacts = allContacts.filter((contact) => {
      return !groupContactIds.includes(contact.id) && contact.id !== this.contact.id;
    });
  }
 
  onAddContactToGroup() {
    if (!this.selectedContactId) {
      return;
    }
    const contactToAdd = this.contactService.getContact(this.selectedContactId);
    if (contactToAdd && !this.groupContacts.find(c => c.id === contactToAdd.id)) {
      this.groupContacts.push(contactToAdd);
      this.selectedContactId = ''; // reset selection
      this.updateAvailableGroupContacts(); // update available list
    }
  }
}

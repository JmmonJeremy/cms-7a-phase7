# Group Contacts Implementation Instructions

This document provides step-by-step instructions for implementing group contacts functionality in the contact-edit component.

## TypeScript Component Changes (`contact-edit.ts`)

### 1. Add Properties

Add the following variables to the `ContactEdit` class:

```typescript
availableContacts: Contact[] = [];
selectedContactId: string = '';
```

### 2. Update ngOnInit Method

Add the following line as the **first line** in `ngOnInit()`:

```typescript
this.availableContacts = this.contactService.getContacts();
```

Add the following method call as the **last line** in `ngOnInit()`:

```typescript
this.updateAvailableGroupContacts();
```

### 3. Add New Methods

Add the following methods to the `ContactEdit` class:

```typescript
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

onRemoveContactFromGroup(index: number) {
  if (index >= 0 && index < this.groupContacts.length) {
    this.groupContacts.splice(index, 1);
    this.updateAvailableGroupContacts(); // update available list
  }
}
```

## HTML Template Changes (`contact-edit.html`)

### Replace Group Contacts Section

In the `contact-edit.html` file, replace the entire **Group Contacts section** with the following HTML:

```html
<div class="row">
  <div class="col-sm-12">
    <label for="groupList">Group Contacts:</label>

    <div class="row">
      <div class="col-sm-8">
        <select class="form-control" [(ngModel)]="selectedContactId" name="selectedContact" title="Select a contact to add to the group">
          <option value="">Select a contact to add...</option>
          <option *ngFor="let contact of availableContacts" [value]="contact.id">
            {{ contact.name }} ({{ contact.email }})
          </option>
        </select>
      </div>
      <div class="col-sm-4">
        <button type="button" class="btn btn-primary" (click)="onAddContactToGroup()" [disabled]="!selectedContactId">
          Add Contact
        </button>
      </div>
    </div>
    
    <hr>

    <div class="row" id="groupList">
      <div *ngFor="let contact of groupContacts; let i = index" class="col-sm-12">
        <div class="row">
          <div class="col-sm-10">
            <strong>{{ contact.name }}</strong> - {{ contact.email }}
          </div>
          <div class="col-sm-2">
            <button type="button" class="btn btn-danger" (click)="onRemoveContactFromGroup(i)">X</button>
          </div>
        </div>
      </div>
      <div *ngIf="groupContacts?.length === 0" class="col-sm-12">
        No contacts added to group yet.
      </div>
    </div>
  </div>
</div>
```

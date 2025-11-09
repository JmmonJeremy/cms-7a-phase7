import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Document } from '../document.model';
import { DocumentService } from '../document.service';

@Component({
  selector: 'cms-document-edit',
  standalone: false,
  templateUrl: './document-edit.html',
  styleUrl: './document-edit.css'
})
export class DocumentEdit implements OnInit {
  originalDocument: Document;
  document: Document;
  editMode: boolean = false;

  constructor( 
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe (
      (params: Params) => {
        const id = params['id'];
        if (!id) {
          this.editMode = false;
          return;
        }  
        this.originalDocument = this.documentService.getDocument(id);  
        if (!this.originalDocument) {
          return;
        }      
        this.editMode = true;
        this.document = JSON.parse(JSON.stringify(this.originalDocument));
      }
    ) 
  }

  onSubmit(form: NgForm) {
    const value = form.value;
    this.document = new Document(
      value.id,
      value.name,
      value.description,
      value.url,
      value.children
    );
    if (this.editMode) {
      this.documentService.updateDocument(this.originalDocument!, this.document);
    } else {
      this.documentService.addDocument(this.document);
    }
    this.router.navigate(['/documents']);
  }
  
  onCancel() {
    this.router.navigate(['/documents']);
  }
}

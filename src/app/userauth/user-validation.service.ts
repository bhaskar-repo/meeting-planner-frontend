import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserValidationService {

   /**
   * @description Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter
   * @author Bhaskar Pawar
   * @param {String} password 
   * @returns boolean is criteria matched or not
   */
  validatePassword = (password: string) => {
    if (/^[A-Za-z0-9]\w{7,}$/.test(password)) {
      return false;
    } else {
      return true;
    }
  }//end of Password

  constructor() { }
}

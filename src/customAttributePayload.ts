import { throws } from "assert";

export class CustomAttributePayload {
  /**
   *
   */
  constructor(responseObject: any) {
    this.lower_limit = responseObject.lower_limit;
    this.upper_limit = responseObject.upper_limit;
    this.user_key = responseObject.user_key;
  }

  public upper_limit: string;
  public lower_limit: string;
  public user_key: string;
}

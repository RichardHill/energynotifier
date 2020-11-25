import { throws } from "assert";

export class CustomAttributePayload {
  /**
   *
   */
  constructor(responseObject: any) {
    this.lower_limit_export = responseObject.lower_limit_export;
    this.upper_limit_export = responseObject.upper_limit_export;
    this.lower_limit_import = responseObject.lower_limit_import;
    this.upper_limit_import = responseObject.upper_limit_import;
    this.product_import = responseObject.product_import;
    this.tariff_import = responseObject.tariff_import;
    this.product_export = responseObject.product_export;
    this.tariff_export = responseObject.tariff_export;
    this.user_key = responseObject.user_key;
  }

  public upper_limit_export: string;
  public lower_limit_export: string;  
  public upper_limit_import: string;
  public lower_limit_import: string;
  public product_import: string;
  public tariff_import: string;
  public product_export: string;
  public tariff_export: string;
  public user_key: string;
}

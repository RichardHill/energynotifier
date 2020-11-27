export class EnergyNotifierUser {

  constructor(theUser: any) {
    this.Name = theUser.Attributes.find(element => element.Name == this.usersName).Value;
    this.phone_number = theUser.Attributes.find(element => element.Name == this.usersPhoneNumber).Value;
    this.email = theUser.Attributes.find(element => element.Name == this.usersEmail).Value;

    this.lower_import_price = theUser.Attributes.find(element => element.Name == this.customImportLowerPrice).Value;
    this.upper_import_price = theUser.Attributes.find(element => element.Name == this.customImportUpperPrice).Value;
    this.lower_export_price = theUser.Attributes.find(element => element.Name == this.customExportLowerPrice).Value;
    this.upper_export_price = theUser.Attributes.find(element => element.Name == this.customExportUpperPrice).Value;
  }

  public Name: string;
  public lower_import_price: number;
  public upper_import_price: number;
  public lower_export_price: number;
  public upper_export_price: number;
  public phone_number: number;
  public email: string;


  private readonly customImportLowerPrice: string = 'custom:lower_power_import';
  private readonly customImportUpperPrice: string = 'custom:upper_power_import';

  private readonly customExportLowerPrice: string = 'custom:lower_power_export';
  private readonly customExportUpperPrice: string = 'custom:upper_power_export';

  private readonly usersName: string = 'name';
  private readonly usersPhoneNumber: string = 'phone_number';
  private readonly usersEmail: string = 'email';
  private readonly contactUserConsentPhoneNumber: string = '';
  private readonly contactUserConsentEmail: string = '';
}

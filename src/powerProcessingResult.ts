
export class PowerProcessingResult {
  /**
   *
   */
  constructor(upper_limit_trigger: boolean, lower_limit_trigger: boolean, theUser: any ) {
    this.upperLimitTrigger = upper_limit_trigger;
    this.lowerLimitTrigger = lower_limit_trigger;
    this.theUser = new EnergyNotifierUser(theUser);
  }

  public upperLimitTrigger: boolean;
  public lowerLimitTrigger: boolean;

  public theUser: EnergyNotifierUser;
}

class EnergyNotifierUser { 

    constructor(theUser: any) { 
        this.Name = theUser.Attributes.find(element => element.Name == this.usersName).Value;
        this.lower_price = theUser.Attributes.find(element => element.Name == this.customLowerPrice).Value;
        this.upper_price = theUser.Attributes.find(element => element.Name == this.customUpperPrice).Value;
        this.phone_number = theUser.Attributes.find(element => element.Name == this.usersPhoneNumber).Value;
        this.email = theUser.Attributes.find(element => element.Name == this.usersEmail).Value;
    }

    public Name: string;
    public lower_price: number;
    public upper_price: number;
    public phone_number: number;
    public email: string;

    private readonly customLowerPrice : string = 'custom:lower_power_price';
    private readonly customUpperPrice : string = 'custom:upper_power_price';
    private readonly usersName : string = 'name';
    private readonly usersPhoneNumber : string = 'phone_number';
    private readonly usersEmail : string = 'email';
    private readonly contactUserConsentPhoneNumber : string = '';
    private readonly contactUserConsentEmail : string = '';

};
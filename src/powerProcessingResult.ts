import { EnergyNotifierUser } from "./EnergyNotifierUser";

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

;
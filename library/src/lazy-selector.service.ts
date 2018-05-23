import { Subject } from 'rxjs';
import { ControlOperations } from './control-operations';

export abstract class LazySelectorService extends ControlOperations {
  onReset: Subject<any>;
}

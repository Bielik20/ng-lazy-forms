import { Subject } from 'rxjs/Subject';
import { ControlOperations } from './control-operations';

export abstract class LazySelectorService extends ControlOperations {
  onReset: Subject<any>;
}

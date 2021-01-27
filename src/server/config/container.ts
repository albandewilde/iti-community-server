import { Container } from "inversify";
import { DomainEventEmitter } from "modules/common/DomainEventEmitter";
import { emitter } from "./emitter";

export const container = new Container();
container.bind(DomainEventEmitter).toConstantValue(emitter);
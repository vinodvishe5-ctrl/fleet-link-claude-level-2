// Part reads (Module 2.D, Part A). Pure read side — no rule; parts stock is only ever changed through
// workOrderService.addParts (FSD rule 8), never here.
import store from '../data/store.js';
import { toPartDto } from '../dtos/mappers.js';

export function listParts() {
  return store.parts.map(toPartDto);
}

import { ValueMapping } from "../../models/interfaces";
import { appDomain } from "../../models/Domains";

export const addAttributeMapping = appDomain.createEvent<{ [key: string]: ValueMapping }>();

export const removeAttributeMapping = appDomain.createEvent<string>();

export const $AttributeMapping = appDomain.createStore<{ [key: string]: ValueMapping }>({})
  .on(addAttributeMapping, (state, mapping) => {
    return { ...state, ...mapping }
  }).on(removeAttributeMapping, (state, key) => {
    const { [key]: mapping, ...others } = state;
    return { ...state, ...others }
  })

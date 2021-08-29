import { ValueMapping } from "../../models/interfaces";
import { appDomain } from "../../models/Domains";

export const addOrganisationMapping = appDomain.createEvent<{ [key: string]: ValueMapping }>();

export const removeOrganisationMapping = appDomain.createEvent<string>();

export const $OrganisationMapping = appDomain.createStore<{ [key: string]: ValueMapping }>({})
  .on(addOrganisationMapping, (state, mapping) => {
    return { ...state, ...mapping }
  }).on(removeOrganisationMapping, (state, key) => {
    const { [key]: mapping, ...others } = state;
    return { ...state, ...others }
  })

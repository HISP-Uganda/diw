import { appDomain } from './Domains';
import { Attribute, Mapping, SheetUpdate, Value, ValueMapping } from './interfaces';
export const createMapping = appDomain.createEvent<Mapping>();
export const home = appDomain.createEvent();
export const changeStoreAttribute = appDomain.createEvent<Attribute>();
export const changeMappingAttribute = appDomain.createEvent<Attribute>();
export const previous = appDomain.createEvent();
export const next = appDomain.createEvent();
export const setData = appDomain.createEvent<any>();
export const setMetaData = appDomain.createEvent<any>();
export const setSheetNames = appDomain.createEvent<any[]>();
export const setCurrentResource = appDomain.createEvent<any>();
export const setCurrentRemoteResource = appDomain.createEvent<any>();
export const addSheet = appDomain.createEvent<string>();
export const removeSheet = appDomain.createEvent<string>();
export const changeSheetAttribute = appDomain.createEvent<Attribute>();
export const addAttributeMapping = appDomain.createEvent<{ [key: string]: ValueMapping }>();
export const removeAttributeMapping = appDomain.createEvent<string>();
export const markAsIdentifier = appDomain.createEvent<[string, boolean]>();
export const addStage = appDomain.createEvent<[string, boolean, boolean]>();
export const changeStageMappingAttribute = appDomain.createEvent<[string, string, any]>();
export const changeStageDataElementMapping = appDomain.createEvent<[string, string, any]>();
export const setLevels = appDomain.createEvent<any>();
export const updateCurrentRemoteResource = appDomain.createEvent<any>();
export const setSourceOrganisationUnits = appDomain.createEvent<any[]>();
export const setDestinationOrganisationUnits = appDomain.createEvent<any[]>();


export const addOrgUnitMapping = appDomain.createEvent<{ [key: string]: ValueMapping }>();
export const removeOrgUnitMapping = appDomain.createEvent<string>();

export const setDestinationParents = appDomain.createEvent<any[]>();
export const setSourceParents = appDomain.createEvent<any[]>();
export const selectSheet = appDomain.createEvent<Value>();

export const setResource = appDomain.createEvent();
export const setActualData = appDomain.createEvent();
export const computeSourceUnits = appDomain.createEvent();

export const updateSourceUnits = appDomain.createEvent();
export const updateDestUnits = appDomain.createEvent();
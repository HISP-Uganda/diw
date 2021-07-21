export type mappingAttributes =
  'id' | 'name' | 'type' | 'description' | 'resource' | 'resourceName' | 'sheets' |
  'headerRow' | 'dataStartRow' | 'orgUnitColumns' | 'createEntities' | 'updateEntities' |
  'createEnrollments' | 'incidentDateProvided' | 'enrollmentDateColumn' | 'incidentDateColumn' |
  'registrationSheet' | 'username' | 'password' | 'url' | 'remoteResource' | 'remoteResourceName' |
  'level' | 'trackedEntityInstanceProvided' | 'trackedEntityInstanceColumn' | 'organisationUnitMapping' |
  'selectedSheet' | 'dataStartColumn' | 'orgUnitColumn' | 'otherOrgUnitColumns' | 'sourceParents' | 'destParents';

export interface Store {
  mapping?: Mapping;
  step: number;
  metadata?: any;
  data?: any;
  sheetNames?: Value[];
  currentResource?: any;
  currentRemoteResource?: any;
  sourceOrganisationUnits?: any[];
  destinationOrganisationUnits?: any[];
  sourceParents?: Value[];
  destParents?: Value[];
  sheet?: Sheet;
  levels?: any;
}

export interface Sheet {
  dataStartColumn?: Value;
  selectedSheet?: Value
  headerRow?: number;
  dataStartRow?: number;
}

export interface ValueMapping {
  equivalent: Value;
  optionMapping?: { [key: string]: string };
  isIdentifier?: boolean
}

export interface Value {
  value: string;
  label: string;
}

export interface StageMapping {
  createEvents?: boolean;
  updateEvents?: boolean;
  dateIdentifiesEvent?: boolean;
  completeEvents?: boolean;
  eventUIDProvided?: boolean;
  sheet?: Value;
  eventDateColumn?: Value;
  eventUIDColumn?: Value;
  latitudeColumn?: Value;
  longitudeColumn?: Value;
  mapping?: { [key: string]: ValueMapping }
}

export interface Mapping {
  id: string;
  name: string;
  type?: Value;
  description?: string;
  resource?: string;
  resourceName?: string;
  headerRow?: number;
  dataStartRow?: number;
  createEntities?: boolean;
  updateEntities?: boolean;
  createEnrollments?: boolean;
  incidentDateProvided?: boolean;
  trackedEntityInstanceProvided?: boolean;
  incidentDateColumn?: Value;
  enrollmentDateColumn?: Value;
  registrationSheet?: Value;
  orgUnitColumn?: Value;
  otherOrgUnitColumns?: Value[];
  trackedEntityInstanceColumn?: Value;
  url?: string;
  username?: string;
  password?: string;
  attributeMapping?: { [key: string]: ValueMapping }
  stageMapping?: { [key: string]: StageMapping }
  organisationUnitMapping?: { [key: string]: ValueMapping }
  remoteResource?: string;
  remoteResourceName?: string;
  level?: string;
}

export interface Attribute {
  key: mappingAttributes,
  value: any
}

export interface SheetUpdate {
  sheet: string;
  attribute: string;
  value: any;
}

export interface Step0Props {
  data: any[];
}

export interface ProgramStageMappingProps {
  stage: any;
}

export interface OptionsProps {
  stage: string;
  attribute: 'sheet' | 'eventDateColumn' | 'eventUIDColumn' | 'latitudeColumn' | 'longitudeColumn'
}
export type mappingAttributes =
  'id' | 'name' | 'type' | 'description' | 'resource' | 'resourceName' | 'sheets' |
  'headerRow' | 'dataStartRow' | 'orgUnitColumns' | 'createEntities' | 'updateEntities' |
  'createEnrollments' | 'incidentDateProvided' | 'enrollmentDateColumn' | 'incidentDateColumn' |
  'registrationSheet' | 'username' | 'password' | 'url' | 'remoteResource' | 'remoteResourceName' |
  'level' | 'trackedEntityInstanceProvided' | 'trackedEntityInstanceColumn' | 'organisationUnitMapping' |
  'selectedSheet' | 'dataStartColumn' | 'orgUnitColumn' | 'otherOrgUnitColumns' | 'sourceParents' |
  'destParents' | 'sourceAttribution' | 'destinationAttribution' | 'destinationCategories' | 'categoriesMapping' |
  'attributeMapping' | 'attributionMapping' | 'stageMapping' | 'categoryOptionComboMapping' | 'updateEnrollments';

export interface Store {
  mapping?: Mapping;
  isOpen?: boolean;
  step: number;
  metadata?: any;
  data?: any;
  sheetNames?: Value[];
  destinationResource?: any;
  sourceResource?: any;
  sourceOrganisationUnits?: any[];
  destinationOrganisationUnits?: any[];
  destinationCategories?: any[];
  sourceCategories?: any[];
  destinationAttributes?: any[];
  destinationStages?: any[];
  destinationCategoryCombos?: any[];
  sourceCategoryCombos?: any[];
  source?: any[];
  sourceStages?: any[];
  destinationAttributions?: any[];
  sourceAttributions?: any[];
  savedMappings?: any[];
  remoteOrgUnitLevels?: any[];
  localOrgUnitLevels?: any[];
  processedData?: TrackedData;
  message?: string;
}

export interface Sheet {
  dataStartColumn?: Value;
  selectedSheet?: Value
  headerRow?: number;
  dataStartRow?: number;
}

export interface ValueMapping {
  equivalent: Value;
  optionSet?: string | null | undefined;
  optionSetValue?: boolean;
  unique?: boolean;
  mandatory?: boolean;
  valueType?: string;
  manual?: boolean;
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
  isRepeatable?: boolean;
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
  remoteResource?: string;
  remoteResourceName?: string;
  sheet?: Sheet;
  sourceParents?: Value[];
  destParents?: Value[];
  trackerInfo?: {
    trackedEntityType?: string;
    onlyEnrollOnce?: boolean;
    updateEnrollments?: boolean;
    selectIncidentDatesInFuture?: boolean;
    selectEnrollmentDatesInFuture?: boolean;
    programType?: string;
    createEntities?: boolean;
    updateEntities?: boolean;
    createEnrollments?: boolean;
    incidentDateProvided?: boolean;
    trackedEntityInstanceProvided?: boolean;
    incidentDateColumn?: Value;
    enrollmentDateColumn?: Value;
    trackedEntityInstanceColumn?: Value;
  }
  dataSetInfo?: {
  }
  orgUnitColumn?: Value;
  otherOrgUnitColumns?: Value[];
  remoteLogins?: {
    url?: string;
    username?: string;
    password?: string;
    aggregationLevel?: { level: any, name: string };
  }
  // categoriesMapping?: { [key: string]: Value }
  // attributeMapping?: { [key: string]: ValueMapping }
  // attributionMapping?: { [key: string]: ValueMapping }
  // stageMapping?: { [key: string]: StageMapping }
  // categoryOptionComboMapping?: { [key: string]: ValueMapping }
  // organisationUnitMapping?: { [key: string]: ValueMapping }
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

export interface TrackedData {
  trackedEntityInstances: any[],
  trackedEntityInstanceUpdates: any[],
  enrollments: any[],
  enrollmentUpdates: any[],
  events: any[],
  eventUpdates: any[],
  missingOrganisations: any[],
  warnings: any[],
}
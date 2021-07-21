import { ChangeEvent } from "react";
import { addAttributeMapping, addSheet, addStage, changeMappingAttribute, markAsIdentifier, removeSheet, changeStageMappingAttribute, changeStageDataElementMapping, addOrgUnitMapping } from "./Events";
import { mappingAttributes } from "./interfaces";

export const onChange = (key: mappingAttributes) => (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
  changeMappingAttribute({ key, value: e.target.value });
}

export const onChange2 = (key: mappingAttributes) => (value: any) => {
  changeMappingAttribute({ key, value });
}
export const onCheck = (key: mappingAttributes) => (e: ChangeEvent<HTMLInputElement>) => {
  changeMappingAttribute({ key, value: e.target.checked });
}

export const onMultipleCheck = (key: mappingAttributes) => (value: any[]) => {
  changeMappingAttribute({ key, value });
}

export const onSelectSheet = (sheet: string) => (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.checked) {
    addSheet(sheet)
  } else {
    removeSheet(sheet);
  }
}

export const addAttribute = (key: string, isIdentifier: boolean) => (equivalent: any) => {
  addAttributeMapping({ [key]: { equivalent, isIdentifier } });
}

export const mark = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
  markAsIdentifier([key, e.target.checked]);
}

export const addStageMapping = (key: string, what: boolean, other: 'create' | 'update') => (e: ChangeEvent<HTMLInputElement>) => {
  if (other === 'create') {
    addStage([key, what, e.target.checked]);
  } else {
    addStage([key, e.target.checked, what]);
  }
}

export const addStageAttribute = (key: string, attribute: string) => (e: any) => {
  changeStageMappingAttribute([key, attribute, e])
}

export const addStageCheckboxAttribute = (key: string, attribute: string) => (e: ChangeEvent<HTMLInputElement>) => {
  changeStageMappingAttribute([key, attribute, e.target.checked])
}

export const addStageDataElement = (key: string, attribute: string) => (e: any) => {
  changeStageDataElementMapping([key, attribute, e])
}

export const addOuMapping = (key: string) => (equivalent: any) => {
  addOrgUnitMapping({ [key]: { equivalent } });
}

export const orgUnitsPayload = {
  sqlQuery: `select ou.* from _orgunitstructure ou where ou.level = \${level};`,
  description: "Query organisation units by level",
  type: "QUERY",
  name: 'Organisation units by level',
  cacheStrategy: "RESPECT_SYSTEM_SETTING",
  id: 'PEYXsyvCwbt',
};

export const dataSetOrgUnitsPayload = {
  sqlQuery: `select ou.* from datasetsource ds inner join dataset das using(datasetid) inner join _orgunitstructure ou on (ou.organisationunitid = ds.sourceid) where das.uid = '\${dataset}';`,
  description: "Query organisation units for a specific data set",
  type: "QUERY",
  name: 'Data set organisation units',
  cacheStrategy: "RESPECT_SYSTEM_SETTING",
  id: 'pErnQQ38kJY',
}

export const programOrgUnitsPayload = {
  sqlQuery: `select ou.* from program_organisationunits po inner join program p using(programid) inner join _orgunitstructure ou using (organisationunitid) where p.uid = '\${program}';`,
  description: "Query organisation units for a specific program",
  type: "QUERY",
  name: 'Program organisation units',
  cacheStrategy: "RESPECT_SYSTEM_SETTING",
  id: 'ZErnQQ38kJY',
}

export const findName = (parents: any[], v: any, last: string) => {
  return [...parents.map((k: any) => v[k]).filter((x: string) => x !== ''), last].join('/')
}

export const autoMapOrganisations = (sourceOrganisationUnits: any[], destinationOrganisationUnits: any[]) => {

  for (const unit of sourceOrganisationUnits) {

  }

}
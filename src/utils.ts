import { ChangeEvent } from "react";
import namor from 'namor'
import {
  addAttributeMapping,
  addSheet,
  addStage,
  changeMappingAttribute,
  markAsIdentifier,
  removeSheet,
  removeAttributeMapping,
  changeStageMappingAttribute,
  addDataElementMapping,
  addOrgUnitMapping,
  addCategoryMapping,
  removeCategoryMapping,
  removeOrgUnitMapping,
  removeAttributionMapping,
  addAttributionMapping,
  removeDataElementMapping,
  updateDataElementMapping,
  changeMappingTrackerInfo,
  changeRemoteLogin
} from "./components/models/Events";
import { mappingAttributes } from "./components/models/interfaces";

export const onChange = (key: mappingAttributes) => (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
  changeMappingAttribute({
    key,
    value: e.target.value
  });
}

export const onRemoteLoginChange = (attribute: 'url' | 'username' | 'password' | 'aggregationLevel') => (e: ChangeEvent<HTMLInputElement>) => {
  changeRemoteLogin({
    attribute,
    value: e.target.value
  })
}

export const onChange2 = (key: mappingAttributes) => (value: any) => {
  changeMappingAttribute({
    key,
    value
  });
}



export const changeCategoryMapping = (key: string) => (value: any) => {
  if (value) {
    addCategoryMapping({ [key]: value })
  } else {
    removeCategoryMapping(key)
  }
}

export const onCheck = (key: mappingAttributes) => (e: ChangeEvent<HTMLInputElement>) => {
  changeMappingAttribute({
    key,
    value: e.target.checked
  });
}

export const onChangeTrackerInfo = (key: mappingAttributes) => (value: any) => {
  changeMappingTrackerInfo({
    key,
    value
  });
}
export const onCheckTrackerInfo = (key: mappingAttributes) => (e: ChangeEvent<HTMLInputElement>) => {
  changeMappingTrackerInfo({
    key,
    value: e.target.checked
  });
}

export const onMultipleCheck = (key: mappingAttributes) => (value: any[]) => {
  changeMappingAttribute({
    key,
    value
  });
}

export const onSelectSheet = (sheet: string) => (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.checked) {
    addSheet(sheet)
  } else {
    removeSheet(sheet);
  }
}

export const addAttribute = (attribute: string, others: any) => (equivalent: any) => {
  console.log(equivalent);
  if (equivalent) {
    addAttributeMapping({ [attribute]: { equivalent, ...others } });
  } else {
    removeAttributeMapping(attribute)
  }
}

export const mark = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
  markAsIdentifier([key, e.target.checked]);
}

export const addStageMapping = (stage: string, what: boolean, other: 'create' | 'update', isRepeatable: boolean) => (e: ChangeEvent<HTMLInputElement>) => {
  if (other === 'create') {
    addStage({ stage, createEvents: what, updateEvents: e.target.checked, isRepeatable });
  } else {
    addStage({ stage, createEvents: e.target.checked, updateEvents: what, isRepeatable });
  }
}

export const addStageAttribute = (key: string, attribute: string) => (e: any) => {
  changeStageMappingAttribute([key, attribute, e])
}

export const addStageCheckboxAttribute = (key: string, attribute: string) => (e: ChangeEvent<HTMLInputElement>) => {
  changeStageMappingAttribute([key, attribute, e.target.checked])
}

export const addStageDataElement = (stage: string, dataElement: string, others: any) => (equivalent: any) => {
  if (equivalent) {
    addDataElementMapping({ stage, dataElement, equivalent, others })
  } else {
    removeDataElementMapping({ stage, dataElement })
  }
}

export const updateStageDataElementMappingAttribute = (stage: string, dataElement: string, attribute: string) => (e: ChangeEvent<HTMLInputElement>) => {
  updateDataElementMapping({ stage, dataElement, attribute, value: e.target.checked })
}

export const addOuMapping = (key: string) => (equivalent: any) => {
  if (equivalent) {
    addOrgUnitMapping({ [key]: { equivalent } });
  } else {
    removeOrgUnitMapping(key);
  }
}

export const addAttribution = (key: string) => (equivalent: any) => {
  if (equivalent) {
    addAttributionMapping({ [key]: { equivalent } });
  } else {
    removeAttributionMapping(key);
  }
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

// function updateStageDataElement(stage: string, dataElement: string, attribute: string, checked: boolean) {
//   throw new Error('Function not implemented.');
// }

const range = (len: number) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newPerson = () => {
  const statusChance = Math.random()
  return {
    firstName: namor.generate({ words: 1, numbers: 0 }),
    lastName: namor.generate({ words: 1, numbers: 0 }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
      statusChance > 0.66
        ? 'relationship'
        : statusChance > 0.33
          ? 'complicated'
          : 'single',
  }
}

export default function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth]
    return range(len).map(d => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }
  return makeDataLevel()
}
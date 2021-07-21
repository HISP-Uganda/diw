import { fromPairs, flatten, uniqBy } from 'lodash';
import { utils } from 'xlsx';
import { guard } from 'effector';
import { appDomain } from './Domains';
import {
  addAttributeMapping,
  addOrgUnitMapping,
  addSheet,
  addStage,
  changeMappingAttribute,
  changeSheetAttribute,
  changeStageDataElementMapping,
  changeStageMappingAttribute,
  createMapping,
  setResource,
  home,
  markAsIdentifier,
  next,
  previous,
  removeAttributeMapping,
  removeOrgUnitMapping,
  removeSheet,
  setCurrentRemoteResource,
  setCurrentResource,
  setData,
  setDestinationOrganisationUnits,
  setDestinationParents,
  setLevels,
  setSheetNames,
  setSourceOrganisationUnits,
  setSourceParents,
  updateCurrentRemoteResource,
  setActualData,
  setMetaData,
  computeSourceUnits,
  updateDestUnits,
  updateSourceUnits,
  changeStoreAttribute
} from "./Events";
import { Attribute, SheetUpdate, Store, Value } from './interfaces';
import { createAPI } from './Queries';
import { findName } from './utils';

export const app = appDomain.createStore<Store>({
  step: 0,
  sheet: {},
  mapping: {
    id: '',
    name: '',
    type: {
      label: "Excel/CSV Line Listing to DHIS2 Program",
      value: "P1"
    },
    attributeMapping: {},
    stageMapping: {},
    organisationUnitMapping: {},
  },
  sheetNames: [],
  levels: [],
  sourceOrganisationUnits: [],
  destinationOrganisationUnits: [],
  destParents: [],
  sourceParents: [],
}).on(createMapping, (state, mapping) => {
  return { ...state, mapping }
}).on(next, (state) => {
  if (['P3', 'C9'].indexOf(state.mapping.type?.value) === -1 && state.step === 2) {
    return { ...state, step: state.step + 2 }
  }
  if (['C6', 'C7', 'C8'].indexOf(state.mapping.type?.value) === -1 && state.step === 4) {
    if (state.mapping.type.value.startsWith('C')) {
      return { ...state, step: state.step + 4 }
    }
    return { ...state, step: state.step + 2 }
  }

  if (['C6', 'C7', 'C8'].indexOf(state.mapping.type?.value) !== -1 && state.step === 5) {
    return { ...state, step: state.step + 3 }
  }
  return { ...state, step: state.step + 1 }
}).on(previous, (state) => {

  if (['P3', 'C9'].indexOf(state.mapping.type?.value) === -1 && state.step === 4) {
    return { ...state, step: state.step - 2 }
  }

  if (['C6', 'C7', 'C8'].indexOf(state.mapping.type?.value) === -1 && state.step === 5) {
    if (state.mapping.type.value.startsWith('C')) {
      return { ...state, step: state.step - 4 }
    }
    return { ...state, step: state.step - 2 }
  }

  if (['C6', 'C7', 'C8'].indexOf(state.mapping.type?.value) !== -1 && state.step === 6) {
    return { ...state, step: state.step - 3 }
  }
  return { ...state, step: state.step - 1 }
}).on(home, (state) => {
  return {
    ...state,
    step: 0,
    mapping: {
      id: '',
      name: '',
      type: {
        label: "Excel/CSV Line Listing to DHIS2 Program",
        value: "P1"
      },
      sheets: {
      },
      attributeMapping: {},
      stageMapping: {}
    }
  }
}).on(changeMappingAttribute, (state, attribute) => {
  const mapping = { ...state.mapping, [attribute.key]: attribute.value }
  return { ...state, mapping }
}).on(setSheetNames, (state, sheetNames) => {
  return { ...state, sheetNames }
}).on(setData, (state, data) => {
  return { ...state, data }
}).on(setMetaData, (state, metadata) => {
  return { ...state, metadata }
}).on(setCurrentResource, (state, currentResource) => {
  return { ...state, currentResource }
}).on(setCurrentRemoteResource, (state, currentRemoteResource) => {
  if (state.mapping.type.value === 'P3') {
    const stageElements = currentRemoteResource.programStages.map(({ id, programStageDataElements }: any) => {
      return [id, {
        headerRow: 1,
        dataStartRow: 2,
        orgUnitColumns: [],
        columns: [{ label: 'eventDate', value: 'eventDate' }, ...programStageDataElements.map(({ dataElement: { id, name } }: any) => {
          return { label: name, value: id }
        })]
      }]
    });
    // return {
    //   ...state, currentRemoteResource, mapping: {
    //     ...state.mapping,
    //     sheets: {
    //       ...state.mapping.sheets,
    //       ...fromPairs(stageElements)
    //     }
    //   }
    // }
  }

  return {
    ...state, currentRemoteResource
  }
}).on(removeSheet, (state, sheet) => {
  // const { [sheet]: removed, ...others } = state.mapping.sheets
  // return { ...state, mapping: { ...state.mapping, sheets: others } }
  return { ...state, mapping: { ...state.mapping } }
}).on(addSheet, (state, sheet) => {
  if (['P1', 'C1', 'C2', 'C3'].indexOf(state.mapping.type.value) !== -1) {
    const sheetData = state.data.Sheets[sheet]
    const range = utils.decode_range(sheetData['!ref']);
    let columns = [];
    if (['P1', 'C1'].indexOf(state.mapping.type.value) !== -1) {
      const cols = []
      for (let column = range.s.c; column <= range.e.c; column++) {
        const secondCell = sheetData[utils.encode_cell({ r: 0, c: column })];
        cols.push({ label: !!secondCell ? secondCell.v : `blank${column}`, value: !!secondCell ? secondCell.v : `blank${column}` });
      }
      columns = cols;

      // return {
      //   ...state,
      //   mapping: {
      //     ...state.mapping,
      //     sheets: {
      //       ...state.mapping.sheets,
      //       [sheet]: {
      //         headerRow: 1,
      //         dataStartRow: 2,
      //         orgUnitColumn: undefined,
      //         otherOrgUnitColumns: [],
      //         columns
      //       }
      //     }
      //   }
      // }
    }

    if (state.mapping.type.value === 'C2') {
      columns = Object.keys(sheetData).map((co: string) => {
        return { label: co, value: co }
      })
    }

    if (state.mapping.type.value === 'C3') {
      columns = Object.keys(sheetData).map((co: string) => {
        return { label: co.replace(/[0-9]/g, ''), value: co.replace(/[0-9]/g, '') }
      })
    }
    // return {
    //   ...state,
    //   mapping: {
    //     ...state.mapping,
    //     sheets: {
    //       ...state.mapping.sheets,
    //       [sheet]: {
    //         orgUnitColumns: [],
    //         columns
    //       }
    //     }
    //   }
    // }
  }

  // if (['P2', 'C4'].indexOf(state.mapping.type.value) !== -1) {
  //   const [record] = state.data;
  //   return {
  //     ...state,
  //     mapping: {
  //       ...state.mapping,
  //       sheets: {
  //         ...state.mapping.sheets,
  //         [sheet]: {
  //           orgUnitColumns: [],
  //           columns: Object.keys(record).map((co: string) => {
  //             return { label: co, value: co }
  //           })
  //         }
  //       }
  //     }
  //   }

  // }
}).on(changeSheetAttribute, (state, attribute) => {
  // let { [sheet.sheet]: currentSheet } = state.mapping.sheets;
  // const sheet = state.sheet.selectedSheet?.value

  // currentSheet = { ...currentSheet, [sheet.attribute]: sheet.value }
  // if (sheet.attribute === 'headerRow') {
  //   const sheetData = state.data.Sheets[sheet.sheet]
  //   const range = utils.decode_range(sheetData['!ref']);
  //   let columns = []

  //   if (['P1', 'C1'].indexOf(state.mapping.type.value) !== -1) {
  //   }

  //   if (state.mapping.type.value === 'C2') {
  //     columns = Object.keys(sheetData).map((co: string) => {
  //       return { label: co, value: co }
  //     })
  //   }

  //   if (state.mapping.type.value === 'C3') {
  //     columns = Object.keys(sheetData).map((co: string) => {
  //       return { label: co.replace(/[0-9]/g, ''), value: co.replace(/[0-9]/g, '') }
  //     })
  //   }

  //   currentSheet = { ...currentSheet, dataStartRow: sheet.value + 1, columns }
  // }
  // return { ...state, mapping: { ...state.mapping, sheets: { ...state.mapping.sheets, [sheet.sheet]: currentSheet } } }
  // return { ...state, mapping: { ...state.mapping } }
  return { ...state, sheet: { ...state.sheet, [attribute.key]: attribute.value } }
}).on(addAttributeMapping, (state, mapping) => {
  return { ...state, mapping: { ...state.mapping, attributeMapping: { ...state.mapping.attributeMapping, ...mapping } } }
}).on(removeAttributeMapping, (state, key) => {
  const { [key]: mapping, ...others } = state.mapping.attributeMapping;
  return { ...state, mapping: { ...state.mapping, attributeMapping: { ...others } } }
}).on(markAsIdentifier, (state, value) => {
  let { [value[0]]: mapping } = state.mapping.attributeMapping;
  mapping = { ...mapping, isIdentifier: value[1] }
  return { ...state, mapping: { ...state.mapping, attributeMapping: { ...state.mapping.attributeMapping, ...{ [value[0]]: mapping } } } }
}).on(addStage, (state, [stage, createEvents, updateEvents]) => {
  if (!createEvents && !updateEvents) {
    const { [stage]: mapping, ...others } = state.mapping.stageMapping;
    return { ...state, mapping: { ...state.mapping, stageMapping: { ...others } } }
  }
  const currentStage = state.mapping.stageMapping[stage];
  if (currentStage) {
    return { ...state, mapping: { ...state.mapping, stageMapping: { ...state.mapping.stageMapping, [stage]: { ...currentStage, createEvents, updateEvents } } } }
  }
  return { ...state, mapping: { ...state.mapping, stageMapping: { ...state.mapping.stageMapping, [stage]: { createEvents, updateEvents, mapping: {} } } } }
}).on(changeStageMappingAttribute, (state, [stage, attribute, value]) => {
  const currentStage = state.mapping.stageMapping[stage];
  if (currentStage) {
    return { ...state, mapping: { ...state.mapping, stageMapping: { ...state.mapping.stageMapping, [stage]: { ...currentStage, [attribute]: value } } } }
  }
}).on(changeStageDataElementMapping, (state, [stage, dataElement, value]) => {
  const currentStage = state.mapping.stageMapping[stage];
  const currentMapping = currentStage.mapping
  return { ...state, mapping: { ...state.mapping, stageMapping: { ...state.mapping.stageMapping, ...{ [stage]: { ...currentStage, mapping: { ...currentMapping, [dataElement]: { equivalent: value } } } } } } }
}).on(setLevels, (state, levels) => {
  return { ...state, levels }
}).on(updateCurrentRemoteResource, (state, organisationUnits) => {
  return { ...state, currentRemoteResource: { ...state.currentRemoteResource, organisationUnits } }
}).on(setSourceOrganisationUnits, (state, sourceOrganisationUnits) => {
  return { ...state, sourceOrganisationUnits }
}).on(setDestinationOrganisationUnits, (state, destinationOrganisationUnits) => {
  return { ...state, destinationOrganisationUnits }
}).on(addOrgUnitMapping, (state, mapping) => {
  return { ...state, mapping: { ...state.mapping, organisationUnitMapping: { ...state.mapping.organisationUnitMapping, ...mapping } } }
}).on(removeOrgUnitMapping, (state, key) => {
  const { [key]: mapping, ...others } = state.mapping.organisationUnitMapping;
  return { ...state, mapping: { ...state.mapping, organisationUnitMapping: { ...others } } }
}).on(setDestinationParents, (state, destinationParents) => {
  return { ...state, destinationParents }
}).on(setSourceParents, (state, sourceParents) => {
  return { ...state, sourceParents }
}).on(setResource, (state) => {
  const sheetData = state.metadata.Sheets[state.sheet.selectedSheet.value]
  const range = utils.decode_range(sheetData['!ref']);
  const cols = []
  for (let column = range.s.c; column <= range.e.c; column++) {
    const secondCell = sheetData[utils.encode_cell({ r: state.sheet.headerRow - 1, c: column })];
    cols.push({
      value: !!secondCell ? secondCell.v : `blank${column}`,
      label: !!secondCell ? secondCell.v : `blank${column}`
    });
  }
  return { ...state, currentResource: cols }
}).on(setActualData, (state) => {
  const sheetData = state.metadata.Sheets[state.sheet.selectedSheet.value]
  const data = utils.sheet_to_json(sheetData, { blankrows: false, header: state.sheet.headerRow - 1, defval: "" });
  return { ...state, data }
}).on(computeSourceUnits, (state) => {
  const sourceOrganisationUnits = state.data.map((u: any) => {
    let parent = {};
    if (state.mapping.otherOrgUnitColumns && state.mapping.otherOrgUnitColumns.length > 0) {
      parent = fromPairs(state.mapping.otherOrgUnitColumns.map((col: Value) => [col.value, u[col.value]]))
    }
    return { id: u[state.mapping.orgUnitColumn.value], name: u[state.mapping.orgUnitColumn.value], parent }
  })
  return { ...state, sourceOrganisationUnits }
}).on(updateDestUnits, (state) => {

}).on(updateSourceUnits, (state) => {

}).on(changeStoreAttribute, (state, { key, value }) => {
  return { ...state, [key]: value }
});

export const nextLabel = app.map((state) => {
  const next = state.step
  if (next !== 0) {
    return "Next"
  }
  return "New Mapping"
});

export const attributes = app.map((state) => {
  // if (state.currentResource && state.mapping && state.mapping.type && state.mapping.type.value.startsWith('P')) {
  //   const { programTrackedEntityAttributes } = state.currentResource;
  //   return programTrackedEntityAttributes.map(({ trackedEntityAttribute, ...other }: any) => {
  //     return { ...other, ...trackedEntityAttribute }
  //   })
  // }
  return []
});

export const $remoteUnits = app.map((state) => {
  const sourceOrganisationUnits = state.sourceOrganisationUnits.map((ou) => {
    const name = findName(state.sourceParents.map((p) => p.value), ou.parent, ou.name);
    const id = ou.name === ou.id ? name : ou.id;
    return { ...ou, id, name }
  });
  return uniqBy(sourceOrganisationUnits, 'id');
});


export const $localUnits = app.map((state)=>{
  const destinationOrganisationUnits = state.destinationOrganisationUnits.map((ou) => {
    const name = findName(state.destParents.map((p) => p.value), ou.parent, ou.name);
    return { ...ou, name }
  })
  return destinationOrganisationUnits
})

export const organisationUnits = app.map((state) => {
  // const locMap = {
  //   P1: () => {
  //     const units = [];
  //     Object.entries(state.mapping.sheets).forEach(([sheetName, sheet]) => {
  //       const sheetData = state.data.Sheets[sheetName];
  //       const index = sheet.columns.findIndex((s: Value) => s.value === sheet.orgUnitColumn?.value);
  //       const othersIndexes = sheet.columns.map((s: Value, i: number) => {
  //         if (sheet.otherOrgUnitColumns.findIndex((sh: Value) => sh.value === s.value) !== -1) {
  //           return i
  //         }
  //         return -1;
  //       }).filter((index: number) => index !== -1);
  //       const range = utils.decode_range(sheetData['!ref']);
  //       if (index !== -1) {
  //         for (let row = state.mapping.sheets[sheetName].dataStartRow - 1; row <= range.e.r; row++) {
  //           const cell = sheetData[utils.encode_cell({ r: row, c: index })];
  //           const name = !!cell ? cell.v : '';
  //           const unit = othersIndexes.map((index: number, i: number) => {
  //             const otherCell = sheetData[utils.encode_cell({ r: row, c: index })];
  //             const value = !!otherCell ? otherCell.v : '';
  //             return [`p${i + 1}`, value]
  //           });
  //           const parent = fromPairs(unit);
  //           units.push({
  //             id: name,
  //             name: name,
  //             parent
  //           });
  //         }
  //       }
  //     });
  //     return uniqBy(units, (d: any) => d.id);
  //   },
  //   P2: () => {
  //     let units = [];
  //     Object.entries(state.mapping.sheets).forEach(([sheetName, sheet]) => {
  //       const index = sheet.columns.find((s: Value) => sheet.orgUnitColumn && s.value === sheet.orgUnitColumn.value)
  //       if (index) {
  //         units = [...units, ...state.data.map((d: any) => {
  //           return { id: d[index.value], name: d[index.value] }
  //         })]
  //       }
  //     });
  //     return units
  //   },
  //   P3: () => { return state.currentRemoteResource?.organisationUnits; },
  //   P4: () => { },
  //   C1: () => { },
  //   C2: () => { },
  //   C3: () => {
  //     const units = [];
  //     Object.entries(state.mapping.sheets).forEach(([sheetName, sheet]) => {
  //       const sheetData = state.data.Sheets[sheetName]
  //       const index = sheet.columns.find((s: Value) => sheet.orgUnitColumn && s.value === sheet.orgUnitColumn.value)
  //       const range = utils.decode_range(sheetData['!ref']);
  //       if (index) {
  //         for (let row = state.mapping.sheets[sheetName].dataStartRow - 1; row <= range.e.r; row++) {
  //           const secondCell = sheetData[utils.encode_cell({ r: row, c: utils.decode_col(index.value) })];
  //           units.push({
  //             id: !!secondCell ? secondCell.v : `blank`,
  //             name: !!secondCell ? secondCell.v : `blank`
  //           });
  //         }
  //       }
  //     });
  //     return units;
  //   },
  //   C4: () => { },
  //   C5: () => { },
  //   C6: () => { return state.currentRemoteResource?.organisationUnits; },
  //   C7: () => { return state.currentRemoteResource?.organisationUnits; },
  //   C8: () => { return state.currentRemoteResource?.organisationUnits; },
  //   C9: () => { return state.currentRemoteResource?.organisationUnits; },
  // }
  // if (Boolean(state.mapping.type)) {
  //   return locMap[state.mapping.type.value] ? locMap[state.mapping.type.value]() : [];
  // }
});

export const stages = app.map((state) => {
  // if (state.currentResource && state.mapping && state.mapping.type && state.mapping.type.value.startsWith('P')) {
  //   const { programStages } = state.currentResource;
  //   return programStages.map(({ programStageDataElements, ...others }: any) => {
  //     const elements = programStageDataElements.map(({ dataElement, ...rest }: any) => {
  //       return { ...rest, ...dataElement };
  //     })
  //     return { ...others, elements }
  //   });
  // }
  return []
});

export const coc = app.map((state) => {
  if (state.currentResource && state.mapping && state.mapping.type && state.mapping.type.value.startsWith('C')) {
    const { dataSetElements } = state.currentResource;
    const allOptions = dataSetElements.map((element: any) => {
      return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
        const id = `${element.dataElement.id},${coc.id}`
        let name = `${element.dataElement.name} ${coc.name}`;
        if (coc.name === 'default') {
          name = element.dataElement.name
        }
        return { ...coc, id, name }
      }))
    });
    return flatten(allOptions);
  }
  return []
});

export const remoteCOC = app.map((state) => {
  if (['C6', 'C7', 'C8', 'C9'].indexOf(state.mapping.type.value) !== -1) {
    if (state.mapping.type.value === 'C9') {
      const { dataSetElements } = state.currentRemoteResource;
      const allOptions = dataSetElements.map((element: any) => {
        return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
          const id = `${element.dataElement.id},${coc.id}`
          let name = `${element.dataElement.name} ${coc.name}`;
          if (coc.name === 'default') {
            name = element.dataElement.name
          }
          return { value: id, label: name }
        }))
      });
      return flatten(allOptions);
    }
    return state.currentRemoteResource
  }
});

export const registrationColumns = app.map((state) => {
  // if (['P1', 'P2', 'P3', 'P4'].indexOf(state.mapping.type.value) !== -1) {
  //   const locMap = {
  //     P1: Object.keys(state.mapping.sheets).length ? state.mapping.sheets[state.mapping.registrationSheet?.value]?.columns : [],
  //     P2: Object.keys(state.mapping.sheets).length ? state.mapping.sheets[state.mapping.registrationSheet?.value]?.columns : [],
  //     P3: Boolean(state.currentRemoteResource) ? [
  //       { label: 'enrollmentDate', value: 'enrollmentDate' },
  //       { label: 'incidentDate', value: 'incidentDate' },
  //       ...state.currentRemoteResource.programTrackedEntityAttributes.map(({ trackedEntityAttribute }: any) => {
  //         return { label: trackedEntityAttribute.name, value: trackedEntityAttribute.id }
  //       })] : [],
  //     P4: [],
  //   }
  //   if (state.mapping.type && state.mapping.type.value.startsWith('P')) {
  //     return locMap[state.mapping.type.value] || [];
  //   }
  // }
});

export const getRemoteAPI = app.map((state) => {
  if (state.mapping.url) {
    return createAPI(state.mapping.url, state.mapping.username, state.mapping.password)
  }
  return undefined;
});

export const showLabel = app.map((state) => {
  return ['C6', 'C7', 'C8'].indexOf(state.mapping.type?.value) !== -1
});

export const excelSheets = app.map((state) => {
  if (['P1', 'P2', 'P3', 'P4'].indexOf(state.mapping.type.value) !== -1) {
    // const locMap = {
    //   P1: Object.keys(state.mapping.sheets).length ? Object.keys(state.mapping.sheets).map((sheet: string) => {
    //     return {
    //       label: sheet,
    //       value: sheet
    //     }
    //   }) : [],
    //   P2: Object.keys(state.mapping.sheets).length ? Object.keys(state.mapping.sheets).map((sheet: string) => {
    //     return {
    //       label: sheet,
    //       value: sheet
    //     }
    //   }) : [],
    //   P3: Boolean(state.currentRemoteResource) ? state.currentRemoteResource.programStages.map(({ id, name }: any) => {
    //     return { label: name, value: id }
    //   }) : [],
    //   P4: [],
    // }
    // if (state.mapping.type && state.mapping.type.value.startsWith('P')) {
    //   return locMap[state.mapping.type.value] || [];
    // }
  }
});

export const booleans = app.map((state) => {
  return {
    showSelectSheet: state.mapping.type.value === 'P1' || state.mapping.type.value === 'P2',
    showDataStartColumn: state.mapping.type.value === 'C3',
    displayMultiple: state.mapping.type.value.startsWith('P')
  }
});


export const labels = app.map((state) => {
  const labels = {
    P1: 'Header Row',
    C3: 'Data Element Row'
  }
  return labels[state.mapping.type.value] || 'Header Row'
});

export const processTabular = app.map((state) => {
  if (state.mapping.type.value === 'C3' && state.sheetNames.length > 0 && !!state.data?.Sheets) {
    // const sheetData = state.data.Sheets[state.sheetNames[0]];
    // const range = utils.decode_range(sheetData['!ref']);
  }
})

export const nextIsDisabled = app.map((state) => {
  // const next = state.step
  // const mapping = state.mapping
  // if (next === 1 && !mapping.name) {
  //   return true
  // }
  return false
});

guard({
  filter: (attribute: any) => attribute.key === 'headerRow' && attribute.value,
  source: changeSheetAttribute,
  target: setResource,
});

guard({
  filter: (attribute: any) => attribute.key === 'dataStartRow' && attribute.value,
  source: changeSheetAttribute,
  target: setActualData,
});

// guard({
//   filter: (attribute: any) => attribute.key === 'sourceParents' && attribute.value,
//   source: changeStoreAttribute,
//   target: updateSourceUnits,
// });

// guard({
//   filter: (attribute: any) => attribute.key === 'destParents' && attribute.value,
//   source: changeStoreAttribute,
//   target: updateDestUnits,
// });


guard({
  filter: (attribute: any) => (attribute.key === 'orgUnitColumn' || attribute.key === 'otherOrgUnitColumns') && attribute.value,
  source: changeMappingAttribute,
  target: computeSourceUnits,
});
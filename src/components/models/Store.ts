import { generateUid } from './../commons';
import { guard, combine } from 'effector';
import { flatten, fromPairs, isEmpty, uniq, uniqBy } from 'lodash';
import { utils } from 'xlsx';
import { findName } from '../../utils';
import { createAPI } from '../Queries';
import { appDomain } from './Domains';
import { StageMapping, TrackedData, ValueMapping } from './interfaces'
import {
  addAttributeMapping,
  addAttributionMapping,
  addCategoryMapping,
  addOrgUnitMapping,
  addStage,
  changeMappingAttribute,
  changeSheetAttribute,
  addDataElementMapping,
  changeStageMappingAttribute,
  changeStoreAttribute,
  computeSourceUnits,
  createMapping,
  home,
  markAsIdentifier,
  next,
  previous,
  removeAttributeMapping,
  removeAttributionMapping,
  removeCategoryMapping,
  removeOrgUnitMapping,
  setActualData,
  setDestinationResource,
  setSourceResource,
  setData,
  setDestinationOrganisationUnits,
  setDestinationParents,
  setRemoteOrgUnitLevels,
  setLocalOrgUnitLevels,
  setMetaData,
  setResource,
  setSheetNames,
  setSourceOrganisationUnits,
  setSourceParents,
  updateCurrentRemoteResource,
  removeDataElementMapping,
  updateDataElementMapping,
  changeMappingTrackerInfo,
  setSavedMappings,
  onClose,
  onOpen,
  setPreviousMapping,
  changeRemoteLogin,
  setProcessedData,
  changeMessage,
  changeStageMapping
} from "./Events";
import { Store, Value } from './interfaces';
import { StatHelpText } from '@chakra-ui/react';

const initialState: Store = {
  step: 0,
  message: '',
  mapping: {
    sheet: {},
    id: generateUid(),
    name: '',
    description: '',
    type: {
      label: "Excel/CSV Line Listing to DHIS2 Program",
      value: "P1"
    },
    trackerInfo: {},
    dataSetInfo: {},
    remoteLogins: {
      username: '',
      password: '',
      url: '',
    },
    // attributeMapping: {},
    // stageMapping: {},
    // organisationUnitMapping: {},
    // categoryOptionComboMapping: {},
    // attributionMapping: {},
    // categoriesMapping: {},
    sourceParents: [],
    destParents: [],

  },
  sheetNames: [],
  remoteOrgUnitLevels: [],
  localOrgUnitLevels: [],
  sourceOrganisationUnits: [],
  destinationOrganisationUnits: [],
  sourceResource: [],
  destinationCategoryCombos: [],
  sourceCategoryCombos: []
}

export const $message = appDomain.createStore<string>('')
  .on(changeMessage, (_, message) => message);

export const $processedData = appDomain.createStore<TrackedData>({
  trackedEntityInstances: [],
  trackedEntityInstanceUpdates: [],
  enrollments: [],
  enrollmentUpdates: [],
  events: [],
  eventUpdates: [],
  missingOrganisations: [],
  warnings: [],

});

export const $organisationUnitMapping = appDomain.createStore<{ [key: string]: ValueMapping }>({
}).on(addOrgUnitMapping, (state, mapping) => {
  return { ...state, ...mapping }
}).on(removeOrgUnitMapping, (state, key) => {
  const { [key]: mapping, ...others } = state;
  return others
});

export const $attributeMapping = appDomain.createStore<{ [key: string]: ValueMapping }>({
}).on(addAttributeMapping, (state, mapping) => {
  return {
    ...state,
    ...mapping
  }
}).on(removeAttributeMapping, (state, key) => {
  const { [key]: mapping, ...others } = state;
  return others
}).on(markAsIdentifier, (state, value) => {
  let { [value[0]]: mapping } = state;
  mapping = { ...mapping, unique: value[1] }
  return { ...state, [value[0]]: mapping }
});

export const $attributionMapping = appDomain.createStore<{ [key: string]: ValueMapping }>({
}).on(addAttributionMapping, (state, mapping) => {
  return {
    ...state,
    ...mapping
  }
}).on(removeAttributionMapping, (state, key) => {
  const { [key]: mapping, ...others } = state;
  return others
});

export const $stageMapping = appDomain.createStore<{ [key: string]: StageMapping }>({
}).on(changeStageMapping, (_, stageMapping) => stageMapping)
  .on(addStage, (state, { stage, createEvents, updateEvents, isRepeatable }) => {
    if (!createEvents && !updateEvents) {
      const { [stage]: mapping, ...others } = state;
      return others
    }
    const currentStage = state[stage];
    if (currentStage) {
      return {
        ...state,
        [stage]: {
          ...currentStage,
          createEvents,
          updateEvents
        }
      }
    }
    return {
      ...state,
      [stage]: {
        createEvents,
        updateEvents,
        isRepeatable,
        mapping: {}
      }
    }
  }).on(changeStageMappingAttribute, (state, [stage, attribute, value]) => {
    const currentStage = state[stage];
    if (currentStage) {
      return {
        ...state,
        [stage]: {
          ...currentStage,
          [attribute]: value
        }
      }
    }
  }).on(addDataElementMapping, (state, { stage, dataElement, equivalent, others }) => {
    const currentStage = state[stage];
    const currentMapping = currentStage.mapping
    return {
      ...state,
      [stage]: {
        ...currentStage,
        mapping: {
          ...currentMapping,
          [dataElement]: {
            equivalent,
            ...others
          }
        }
      }
    }
  }).on(updateDataElementMapping, (state, { stage, dataElement, attribute, value }) => {
    const currentStage = StatHelpText[stage];
    const currentMapping = currentStage.mapping
    const currentDataElementMapping = currentMapping[dataElement]
    return {
      ...state,
      [stage]: {
        ...currentStage,
        mapping: {
          ...currentMapping,
          [dataElement]: {
            ...currentDataElementMapping,
            [attribute]: value
          }
        }
      }
    }
  }).on(removeDataElementMapping, (state, { stage, dataElement }) => {
    const currentStage = state[stage];
    const currentMapping = currentStage.mapping
    const {
      [dataElement]: dataElementMapping,
      ...others
    } = currentMapping
    return {
      ...state,
      [stage]: {
        ...currentStage,
        mapping: others
      }
    }
  });

export const $categoryOptionComboMapping = appDomain.createStore<{ [key: string]: ValueMapping }>({
});

export const $categoryMapping = appDomain.createStore<{ [key: string]: Value }>({

}).on(addCategoryMapping, (state, mapping) => {
  return {
    ...state,
    ...mapping
  }
}).on(removeCategoryMapping, (state, key) => {
  const { [key]: mapping, ...others } = state;
  return others
});

const trackedEntityInstances = appDomain.createStore<any[]>([])
const enrollments = appDomain.createStore<any[]>([])
const events = appDomain.createStore<any[]>([])

const trackedEntityInstanceUpdates = appDomain.createStore<any[]>([])
const enrollmentUpdates = appDomain.createStore<any[]>([])
const eventUpdates = appDomain.createStore<any[]>([])

const dataValueSets = appDomain.createStore<any[]>([])

const missingOrganisations = appDomain.createStore<any[]>([])
const warnings = appDomain.createStore<any[]>([])

export const app = appDomain.createStore<Store>(initialState)
  .on(setProcessedData, (state, processedData) => {
    return { ...state, processedData }
  })
  .on(onOpen, (state) => {
    return { ...state, isOpen: true }
  })
  .on(onClose, (state) => {
    return { ...state, isOpen: false }
  })
  .on(setPreviousMapping, (state, previousMapping) => {
    return { ...state, previousMapping }
  })
  .on(createMapping, (state, mapping) => {
    return { ...state, mapping };
  })
  .on(next, (state) => {

    if (['P3', 'C6', 'C7', 'C8', 'C9'].indexOf(state.mapping.type?.value) === -1 && state.step === 2) {
      return { ...state, step: state.step + 2 }
    }

    if (state.mapping.type.value.startsWith('C') && state.step === 4) {
      return { ...state, step: state.step + 3 }
    }

    if (state.mapping.type.value.startsWith('P') && state.step === 6) {
      if (state.destinationAttributes.length !== 0) {
        return { ...state, step: state.step + 3 }
      }
      return { ...state, step: state.step + 2 }
    }
    return { ...state, step: state.step + 1 }
  })
  .on(previous, (state) => {
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
    if (state.mapping.type.value.startsWith('P') && state.step === 9) {
      return { ...state, step: state.step - 2 }
    }

    return { ...state, step: state.step - 1 }
  })
  .on(home, () => initialState)
  .on(changeMappingTrackerInfo, (state, attribute) => {
    const mapping = {
      ...state.mapping,
      trackerInfo: {
        ...state.mapping.trackerInfo,
        [attribute.key]: attribute.value
      }
    }
    return { ...state, mapping }
  })
  .on(setSavedMappings, (state, savedMappings) => {
    return { ...state, savedMappings }
  })
  .on(changeMappingAttribute, (state, attribute) => {
    const mapping = { ...state.mapping, [attribute.key]: attribute.value }
    return { ...state, mapping }
  }).on(changeRemoteLogin, (state, { attribute, value }) => {

    return {
      ...state, mapping: {
        ...state.mapping,
        remoteLogins: {
          ...state.mapping.remoteLogins,
          [attribute]: value
        }
      }
    }
  })
  .on(changeSheetAttribute, (state, { key, value }) => {
    return {
      ...state,
      mapping: {
        ...state.mapping,
        sheet: {
          ...state.mapping.sheet,
          [key]: value
        }
      }
    }
  })
  .on(setSheetNames, (state, sheetNames) => {
    return { ...state, sheetNames }
  })
  .on(setData, (state, data) => {
    return { ...state, data }
  })
  .on(setMetaData, (state, metadata) => {
    return { ...state, metadata }
  })
  .on(setDestinationResource, (state, destinationResource) => {
    const destinationAttributions = destinationResource.categoryCombo.categoryOptionCombos.filter((coc: any) => {
      return coc.name !== 'default'
    });
    const destinationCategories = destinationResource.categoryCombo.categories.filter((category: any) => {
      return category.name !== 'default'
    });
    if (state.mapping.type.value.startsWith('P')) {
      const { selectIncidentDatesInFuture, selectEnrollmentDatesInFuture, programType, onlyEnrollOnce, trackedEntityType } = destinationResource;
      const { programTrackedEntityAttributes } = destinationResource;
      const destinationAttributes = programTrackedEntityAttributes.map(({ trackedEntityAttribute, ...other }: any) => {
        return {
          ...other,
          ...trackedEntityAttribute
        }
      });
      const { programStages } = destinationResource;
      const destinationStages = programStages.map(({ programStageDataElements, ...others }: any) => {
        const elements = programStageDataElements.map(({ dataElement, ...rest }: any) => {
          return { ...rest, ...dataElement };
        })
        return { ...others, elements }
      });
      return {
        ...state,
        destinationAttributions,
        destinationCategories,
        destinationAttributes,
        destinationStages,
        mapping: {
          ...state.mapping,
          trackerInfo: {
            ...state.mapping.trackerInfo,
            selectIncidentDatesInFuture,
            selectEnrollmentDatesInFuture,
            programType,
            onlyEnrollOnce,
            trackedEntityType: trackedEntityType.id
          }
        }
      }
    }
    if (state.mapping.type.value.startsWith('C')) {
      const { dataSetElements } = destinationResource;
      const allOptions = dataSetElements.map((element: any) => {
        console.log(element.dataElement)
        return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
          const id = `${element.dataElement.id},${coc.id}`
          let name = `${element.dataElement.name} ${coc.name}`;
          if (coc.name === 'default') {
            name = element.dataElement.name
          }
          return { ...coc, id, name }
        }))
      });
      const destinationCategoryCombos = flatten(allOptions);
      return { ...state, destinationCategoryCombos, destinationAttributions, destinationCategories }
    }
  })
  // .on(addAttributeMapping, (state, mapping) => {
  //   return { ...state, mapping: { ...state.mapping, attributeMapping: { ...state.mapping.attributeMapping, ...mapping } } }
  // })
  // .on(removeAttributeMapping, (state, key) => {
  //   const { [key]: mapping, ...others } = state.mapping.attributeMapping;
  //   return { ...state, mapping: { ...state.mapping, attributeMapping: { ...others } } }
  // })
  // .on(markAsIdentifier, (state, value) => {
  //   let { [value[0]]: mapping } = state.mapping.attributeMapping;
  //   mapping = { ...mapping, unique: value[1] }
  //   return { ...state, mapping: { ...state.mapping, attributeMapping: { ...state.mapping.attributeMapping, ...{ [value[0]]: mapping } } } }
  // })
  // .on(addStage, (state, { stage, createEvents, updateEvents, isRepeatable }) => {
  //   if (!createEvents && !updateEvents) {
  //     const { [stage]: mapping, ...others } = state.mapping.stageMapping;
  //     return { ...state, mapping: { ...state.mapping, stageMapping: { ...others } } }
  //   }
  //   const currentStage = state.mapping.stageMapping[stage];
  //   if (currentStage) {
  //     return {
  //       ...state,
  //       mapping: {
  //         ...state.mapping,
  //         stageMapping: {
  //           ...state.mapping.stageMapping,
  //           [stage]: {
  //             ...currentStage,
  //             createEvents,
  //             updateEvents
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return {
  //     ...state, mapping: {
  //       ...state.mapping,
  //       stageMapping: {
  //         ...state.mapping.stageMapping,
  //         [stage]: {
  //           createEvents,
  //           updateEvents,
  //           isRepeatable,
  //           mapping: {}
  //         }
  //       }
  //     }
  //   }
  // })
  // .on(changeStageMappingAttribute, (state, [stage, attribute, value]) => {
  //   const currentStage = state.mapping.stageMapping[stage];
  //   if (currentStage) {
  //     return {
  //       ...state,
  //       mapping: {
  //         ...state.mapping,
  //         stageMapping: {
  //           ...state.mapping.stageMapping,
  //           [stage]: {
  //             ...currentStage, [attribute]: value
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // .on(addDataElementMapping, (state, { stage, dataElement, equivalent, others }) => {
  //   const currentStage = state.mapping.stageMapping[stage];
  //   const currentMapping = currentStage.mapping
  //   return {
  //     ...state,
  //     mapping: {
  //       ...state.mapping,
  //       stageMapping: {
  //         ...state.mapping.stageMapping,
  //         ...{
  //           [stage]: {
  //             ...currentStage,
  //             mapping: {
  //               ...currentMapping,
  //               [dataElement]: {
  //                 equivalent,
  //                 ...others
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // .on(updateDataElementMapping, (state, { stage, dataElement, attribute, value }) => {
  //   const currentStage = state.mapping.stageMapping[stage];
  //   const currentMapping = currentStage.mapping
  //   const currentDataElementMapping = currentMapping[dataElement]
  //   return {
  //     ...state,
  //     mapping: {
  //       ...state.mapping,
  //       stageMapping: {
  //         ...state.mapping.stageMapping,
  //         ...{
  //           [stage]: {
  //             ...currentStage,
  //             mapping: {
  //               ...currentMapping,
  //               [dataElement]: {
  //                 ...currentDataElementMapping,
  //                 [attribute]: value
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // .on(removeDataElementMapping, (state, { stage, dataElement }) => {
  //   const currentStage = state.mapping.stageMapping[stage];
  //   const currentMapping = currentStage.mapping
  //   const {
  //     [dataElement]: dataElementMapping,
  //     ...others
  //   } = currentMapping
  //   return {
  //     ...state,
  //     mapping: {
  //       ...state.mapping,
  //       stageMapping: {
  //         ...state.mapping.stageMapping,
  //         ...{
  //           [stage]: {
  //             ...currentStage,
  //             mapping: others
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  .on(setRemoteOrgUnitLevels, (state, remoteOrgUnitLevels) => {
    return { ...state, remoteOrgUnitLevels }
  })
  .on(setLocalOrgUnitLevels, (state, localOrgUnitLevels) => {
    return { ...state, localOrgUnitLevels }
  })
  .on(updateCurrentRemoteResource, (state, organisationUnits) => {
    return { ...state, sourceResource: { ...state.sourceResource, organisationUnits } }
  })
  .on(setSourceOrganisationUnits, (state, sourceOrganisationUnits) => {
    return { ...state, sourceOrganisationUnits }
  })
  .on(setDestinationOrganisationUnits, (state, destinationOrganisationUnits) => {
    return { ...state, destinationOrganisationUnits }
  })
  // .on(addOrgUnitMapping, (state, mapping) => {
  //   return { ...state, mapping: { ...state.mapping, organisationUnitMapping: { ...state.mapping.organisationUnitMapping, ...mapping } } }
  // })
  // .on(removeOrgUnitMapping, (state, key) => {
  //   const { [key]: mapping, ...others } = state.mapping.organisationUnitMapping;
  //   return { ...state, mapping: { ...state.mapping, organisationUnitMapping: { ...others } } }
  // })
  .on(setDestinationParents, (state, destinationParents) => {
    return { ...state, destinationParents }
  })
  .on(setSourceParents, (state, sourceParents) => {
    return { ...state, sourceParents }
  })
  .on(setSourceResource, (state, sourceResource) => {
    if (state.mapping.type.value.startsWith('P')) {
      if (state.mapping.type.value === 'P3') {
        const { programTrackedEntityAttributes } = sourceResource;
        const sourceAttributes = programTrackedEntityAttributes.map(({ trackedEntityAttribute, ...other }: any) => {
          return {
            ...other,
            ...trackedEntityAttribute
          }
        });
        const { programStages } = sourceResource;
        const sourceStages = programStages.map(({ programStageDataElements, ...others }: any) => {
          const elements = programStageDataElements.map(({ dataElement, ...rest }: any) => {
            return { ...rest, ...dataElement };
          })
          return { ...others, elements }
        });
        return {
          ...state,
        }
      }

      return {
        ...state,
        sourceResource
      }
    }
    if (state.mapping.type.value.startsWith('C')) {
      if (['C6', 'C7', 'C8'].indexOf(state.mapping.type.value) !== -1) {
        return {
          ...state,
          sourceCategoryCombos: sourceResource['programIndicators'] || sourceResource['dataElements'] || sourceResource['indicators']
        }
      }
      if (state.mapping.type.value === 'C9') {
        const sourceAttributions = sourceResource.categoryCombo.categoryOptionCombos.filter((coc: any) => {
          return coc.name !== 'default'
        });
        const sourceCategories = sourceResource.categoryCombo.categories.filter((category: any) => {
          return category.name !== 'default'
        });
        const { dataSetElements } = sourceResource;
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
        const sourceCategoryCombos = flatten(allOptions);
        return {
          ...state,
          sourceCategoryCombos,
          sourceAttributions,
          sourceCategories
        }
      }
    }

  })
  .on(setResource, (state) => {
    const sheetData = state.metadata.Sheets[state.mapping.sheet.selectedSheet.value]
    const range = utils.decode_range(sheetData['!ref']);
    const cols = []
    for (let column = range.s.c; column <= range.e.c; column++) {
      const secondCell = sheetData[utils.encode_cell({ r: state.mapping.sheet.headerRow - 1, c: column })];
      cols.push({
        value: !!secondCell ? secondCell.v : `blank${column}`,
        label: !!secondCell ? secondCell.v : `blank${column}`
      });
    }
    return { ...state, sourceResource: cols }
  })
  .on(setActualData, (state) => {
    const sheetData = state.metadata.Sheets[state.mapping.sheet.selectedSheet.value]
    const data = utils.sheet_to_json(sheetData, { blankrows: false, header: state.mapping.sheet.headerRow - 1, defval: "", raw: false, rawNumbers: false });
    return { ...state, data }
  })
  .on(computeSourceUnits, (state) => {
    const sourceOrganisationUnits = state.data.map((u: any) => {
      let parent = {};
      if (state.mapping.otherOrgUnitColumns && state.mapping.otherOrgUnitColumns.length > 0) {
        parent = fromPairs(state.mapping.otherOrgUnitColumns.map((col: Value) => [col.value, u[col.value]]))
      }
      return { id: u[state.mapping.orgUnitColumn.value], name: u[state.mapping.orgUnitColumn.value], parent }
    })
    return { ...state, sourceOrganisationUnits }
  })
  .on(changeStoreAttribute, (state, { key, value }) => {
    return { ...state, [key]: value }
  })
// .on(addCategoryMapping, (state, mapping) => {
//   return { ...state, mapping: { ...state.mapping, categoriesMapping: { ...state.mapping.categoriesMapping, ...mapping } } }
// })
// .on(removeCategoryMapping, (state, key) => {
//   const { [key]: mapping, ...others } = state.mapping.categoriesMapping;
//   return { ...state, mapping: { ...state.mapping, categoriesMapping: { ...others } } }
// })
// .on(addAttributionMapping, (state, mapping) => {
//   return { ...state, mapping: { ...state.mapping, attributionMapping: { ...state.mapping.attributionMapping, ...mapping } } }
// })
// .on(removeAttributionMapping, (state, key) => {
//   const { [key]: mapping, ...others } = state.mapping.attributionMapping;
//   return { ...state, mapping: { ...state.mapping, attributionMapping: { ...others } } }
// });

export const nextLabel = app.map((state) => {
  const next = state.step
  if (next !== 0) {
    return "Next"
  }
  return "New Mapping"
});

export const $sourceOrganisationUnits = app.map((state) => {
  const sourceOrganisationUnits = state.sourceOrganisationUnits.map((ou) => {
    const name = findName(state.mapping.sourceParents.map((p) => p.value), ou.parent, ou.name);
    const id = ou.name === ou.id ? name : ou.id;
    return { ...ou, id, name }
  });
  return uniqBy(sourceOrganisationUnits, 'id');
});

export const $destinationOrganisationUnits = app.map((state) => {
  const destinationOrganisationUnits = state.destinationOrganisationUnits.map((ou) => {
    const name = findName(state.mapping.destParents.map((p) => p.value), ou.parent, ou.name);
    return { ...ou, name }
  })
  return destinationOrganisationUnits
});

export const $sourceAttributions = combine(app, $categoryMapping, (app, cm) => {
  const categoryMapping = Object.keys(cm);
  if (app.mapping.type && app.mapping.type.value === 'P1' && categoryMapping.length > 0 && categoryMapping.length === app.destinationResource.categoryCombo.categories.length) {
    console.log('What is happening')
    const values = Object.values(cm).map((col: Value) => col.value)

    if (categoryMapping.length === 1) {
      const [c1] = values;
      return uniq(app.data.map((x: any) => x[c1]));

    } else if (categoryMapping.length === 2) {
      const [c1, c2] = values;
      const d1 = uniq(app.data.map((x: any) => x[c1]));
      const d2 = uniq(app.data.map((x: any) => x[c2]));
      const x = d1.map((d) => {
        return d2.map((c) => {
          return `${d}, ${c}`;
        })
      });
      return flatten(x);

    } else if (categoryMapping.length === 3) {
      const options = [];
      const [c1, c2, c3] = values;
      const d1 = uniq(app.data.map((x: any) => x[c1]));
      const d2 = uniq(app.data.map((x: any) => x[c2]));
      const d3 = uniq(app.data.map((x: any) => x[c3]));

      for (let i = 0; i < d1.length; i++) {
        for (let j = 0; j < d2.length; j++) {
          for (let k = 0; k < d2.length; k++) {
            options.push(`${d1[i]}, ${d2[j]}, ${d3[k]}`)
          }
        }
      }
      return options;
    }
  }
  return []
});

// export const $sourceCategoryCombos = app.map((state) => {
//   if (['C6', 'C7', 'C8', 'C9'].indexOf(state.mapping.type.value) !== -1  && state.sourceResource) {
//     if (state.mapping.type.value === 'C9') {
//       const { dataSetElements } = state.sourceResource;
//       const allOptions = dataSetElements.map((element: any) => {
//         return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
//           const id = `${element.dataElement.id},${coc.id}`
//           let name = `${element.dataElement.name} ${coc.name}`;
//           if (coc.name === 'default') {
//             name = element.dataElement.name
//           }
//           return { value: id, label: name }
//         }))
//       });
//       return flatten(allOptions);
//     }
//     return state.sourceResource
//   }
// });

// export const $destinationCategoryCombos = app.map((state) => {
//   if (['C6', 'C7', 'C8', 'C9'].indexOf(state.mapping.type.value) !== -1 && state.sourceResource) {
//     if (state.mapping.type.value === 'C9') {
//       const { dataSetElements } = state.sourceResource;
//       const allOptions = dataSetElements.map((element: any) => {
//         return flatten(element.dataElement.categoryCombo.categoryOptionCombos.map((coc: any) => {
//           const id = `${element.dataElement.id},${coc.id}`
//           let name = `${element.dataElement.name} ${coc.name}`;
//           if (coc.name === 'default') {
//             name = element.dataElement.name
//           }
//           return { value: id, label: name }
//         }))
//       });
//       return flatten(allOptions);
//     }
//     return state.sourceResource
//   }
// });

export const getRemoteAPI = app.map((state) => {
  if (state.mapping.remoteLogins.url) {
    return createAPI(state.mapping.remoteLogins.url, state.mapping.remoteLogins.username, state.mapping.remoteLogins.password)
  }
});

export const $requiresLevel = app.map((state) => {
  return ['C6', 'C7', 'C8'].indexOf(state.mapping.type?.value) !== -1
});

export const excelSheets = app.map((state) => {
  if (['P1', 'P2', 'P3', 'P4'].indexOf(state.mapping.type.value) !== -1) {

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

export const $nextIsDisabled = app.map((state) => {
  const steps = {
    0: false,
    1: isEmpty(state.metadata)
  }

  return false
})

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

guard({
  filter: (attribute: any) => (attribute.key === 'orgUnitColumn' || attribute.key === 'otherOrgUnitColumns') && attribute.value,
  source: changeMappingAttribute,
  target: computeSourceUnits,
});


// app.watch((store) => {
//   console.log(store);
// })
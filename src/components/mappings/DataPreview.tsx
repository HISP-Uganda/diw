import { format, parseISO } from 'date-fns';
import { diff } from 'deep-diff';
import { useStore } from 'effector-react';
import { chunk, flatMap, flatten, fromPairs, groupBy, isEmpty, uniq } from 'lodash';
import { useEffect } from 'react';
import { useD2 } from '../../Context';
import { generateUid } from '../commons';
import { changeMessage, onClose, onOpen, setProcessedData } from '../models/Events';
import {
  $attributeMapping,
  $attributionMapping,
  $categoryOptionComboMapping, $organisationUnitMapping,
  $stageMapping,
  app
} from '../models/Store';
import { findValue, validate } from '../validation-utils';
import { TrackerDataPreview } from './TrackerDataPreview';

export const convertDataToURL = (objs: any[]) => {
  return objs
    .map((s) => {
      return `filter=${s.param}:IN:${s.value.join(';')}`;
    })
    .join("&");
};

const DataPreview = () => {
  const store = useStore(app)
  const organisationUnitMapping = useStore($organisationUnitMapping);
  const attributeMapping = useStore($attributeMapping);
  const stageMapping = useStore($stageMapping);
  const categoryOptionComboMapping = useStore($categoryOptionComboMapping);
  const attributionMapping = useStore($attributionMapping);
  const d2 = useD2();

  useEffect(() => {
    if (store.mapping.type.value.startsWith('C')) {
      processDataset();
    } else {
      processTrackerProgram();
    }
  }, [])
  const findIdentifiers = () => {
    const identifiers = Object.entries(attributeMapping).filter(([_, { unique }]) => unique).map(([attribute, { equivalent }]) => {
      return [attribute, equivalent.value];
    });
    return fromPairs(identifiers);
  }

  const groupData = () => {
    const processedIdentifiers = findIdentifiers();
    const data = store.data.map((d: any) => {
      const key = Object.keys(processedIdentifiers).join('');
      const value = Object.values(processedIdentifiers).map((k: string) => d[k]).join('');
      return { ...d, [key]: value }
    });
    return groupBy(data, Object.keys(processedIdentifiers).join(''));
  }

  const fetchData = async () => {
    const { trackerInfo: { trackedEntityType }, resource } = store.mapping;
    const processedIdentifiers = findIdentifiers();
    if (Object.keys(processedIdentifiers).length > 0) {
      const chunks = chunk(store.data, 50);
      const api = d2.Api.getApi();
      let previousData = [];
      for (const c of chunks) {
        const urlObject = Object.keys(processedIdentifiers).map((attr: string) => {
          return { param: attr, value: c.map((d: any) => d[processedIdentifiers[attr]]) }
        });
        const { trackedEntityInstances } = await api.get(`trackedEntityInstances?${convertDataToURL(urlObject)}&trackedEntityType=${trackedEntityType}&ouMode=ALL&fields=*`);

        const processed = trackedEntityInstances.map(({ enrollments, trackedEntityInstance, attributes }: any) => {
          let identifierValues = attributes.filter(({ attribute }: any) => Object.keys(processedIdentifiers).indexOf(attribute) !== -1).map(({ value }: any) => value).join('');

          const data = attributes.map(({ attribute, value }) => {
            return [attribute, value]
          });

          let instances = { [Object.keys(processedIdentifiers).join('')]: identifierValues, trackedEntityInstance, attributes: fromPairs(data) }
          const currentEnrollments = enrollments.filter((e: any) => e.program === resource);

          instances = {
            ...instances,
            enrollments: fromPairs(currentEnrollments.map(({ enrollmentDate, orgUnit, enrollment, incidentDate }: any) => [enrollment, { orgUnit, incidentDate: format(parseISO(incidentDate), 'yyyy-MM-dd'), enrollmentDate: format(parseISO(enrollmentDate), 'yyyy-MM-dd') }]))
          }
          const evs = currentEnrollments.map(({ events, enrollment }: any) => {
            return events.map(({ eventDate, status, orgUnit, program, event, programStage, dataValues }) => {
              return { eventDate: format(parseISO(eventDate), 'yyyy-MM-dd'), orgUnit, enrollment, program, event, status, programStage, ...fromPairs(dataValues.map(({ dataElement, value }: any) => [dataElement, value])) }
            })
          });
          const programStageEvents = groupBy(flatten(evs), 'programStage');
          instances = { ...instances, events: programStageEvents }

          return instances
        });
        previousData = [...previousData, ...processed]
      }
      return groupBy(previousData, Object.keys(processedIdentifiers).join(''))
    }
    return {};
  }

  const getAllOptionsSets = async () => {
    const api = d2.Api.getApi();
    const attributeOptionSets = flatMap(Object.values(attributeMapping), (mapping) => mapping.optionSetValue ? [mapping.optionSet] : []);
    const dataElementOptionSets = flatMap(Object.values(stageMapping), (mapping) => {
      return flatMap(Object.values(mapping.mapping), (vm) => vm.optionSetValue ? [vm.optionSet] : [])
    });
    const allOptionSets = uniq([...attributeOptionSets, ...dataElementOptionSets]);

    const { optionSets } = await api.get('optionSets', { filter: `id:in:[${allOptionSets.join(',')}]`, fields: 'id,options[code,name]' })

    return fromPairs(optionSets.map(({ id, options }: { id: string, options: { code: string, name: string } }) => [id, options]));
  }

  const processDataset = async () => {
  }

  const processTrackerProgram = async () => {
    changeMessage('Starting processing data')
    onOpen()
    const {
      orgUnitColumn,
      otherOrgUnitColumns,
      sourceParents,
      destParents,
      resource,
      trackerInfo: {
        trackedEntityType,
        createEnrollments,
        updateEnrollments,
        updateEntities,
        onlyEnrollOnce,
        createEntities,
        enrollmentDateColumn,
      }
    } = store.mapping;

    changeMessage('Fetching all option sets and previous data')
    const response = await Promise.all([fetchData(), getAllOptionsSets()]);
    const previousData = response[0];
    const optionSets: any = response[1]
    changeMessage('Grouping data based on the specified identifier');
    const groupedData = groupData();
    const trackedEntityInstances = [];
    const trackedEntityInstanceUpdates = [];
    const enrollments = [];
    const enrollmentUpdates = [];
    const events = [];
    const eventUpdates = [];
    const missingOrganisations = [];
    const warnings = []

    for (const [identifier, data] of Object.entries(groupedData)) {
      const previous = previousData[identifier];
      const oldData = !!previous && previous.length === 1 ? previous[0] : {};
      const foundOrgUnit = [...sourceParents.map(({ value }) => data[0][value]), data[0][orgUnitColumn.value]].join('/');
      const orgUnit = organisationUnitMapping[foundOrgUnit]?.equivalent.value;
      const trackedEntityInstance = oldData.trackedEntityInstance || generateUid();
      let enrollmentIds = {};
      const attributes = []

      if (orgUnit) {
        changeMessage(`Composing tracked entity attributes for ${identifier}`)
        for (const [attribute, mapping] of Object.entries(attributeMapping)) {
          let value = data[0][mapping.equivalent.value];
          if (!!value) {
            if (mapping.optionSetValue) {
              const search = optionSets[mapping.optionSet].find((o: any) => o.code === value || o.name === value);
              if (search) {
                attributes.push({ attribute, value: search.code })
              } else {
                warnings.push({ identifier, message: `Could not find option ${value}: expected ${optionSets[mapping.optionSet].map((x: any) => x.code).join(',')}` })
              }
            } else if (validate(mapping, value)) {
              attributes.push({ attribute, value: findValue(mapping, value) })
            } else {
              warnings.push({ identifier, message: `Failed to validate ${value} as ${mapping.valueType}` })
            }
          }
        }
        changeMessage(`Composing enrollments for ${identifier}`)
        if (isEmpty(oldData)) {
          if (createEntities) {
            trackedEntityInstances.push({
              trackedEntityInstance,
              attributes,
              orgUnit,
              trackedEntityType
            });
          }
          if (createEnrollments && enrollmentDateColumn && enrollmentDateColumn.value) {
            const uniqueEnrollments = uniq(data.map((d: any) => {
              return format(parseISO(d[enrollmentDateColumn.value]), 'yyyy-MM-dd')
            }));

            if (uniqueEnrollments.length > 0) {
              if (onlyEnrollOnce) {
                const enrollment = generateUid()
                enrollments.push({
                  enrollment,
                  trackedEntityInstance,
                  program: resource,
                  enrollmentDate: uniqueEnrollments[uniqueEnrollments.length - 1],
                  orgUnit,
                  incidentDate: uniqueEnrollments[uniqueEnrollments.length - 1]
                });
                enrollmentIds = { [uniqueEnrollments[uniqueEnrollments.length - 1]]: enrollment };
              } else {
                for (const enrollmentDate of uniqueEnrollments) {
                  const enrollment = generateUid()
                  enrollments.push({
                    enrollment,
                    trackedEntityInstance,
                    program: resource,
                    enrollmentDate,
                    orgUnit,
                    incidentDate: enrollmentDate
                  });
                  enrollmentIds = { ...enrollmentIds, enrollmentDate: enrollment };
                }
              }
            }
          }
        } else {
          enrollmentIds = fromPairs(Object.entries(oldData.enrollments).map(([e, { enrollmentDate }]: any) => [enrollmentDate, e]))
        }
        changeMessage(`Composing events for ${identifier}`)
        for (const [programStage, { mapping, eventDateColumn, completeEvents, eventUIDColumn, eventUIDProvided, createEvents, updateEvents, isRepeatable, dateIdentifiesEvent }] of Object.entries(stageMapping)) {
          let oldStageEvents = oldData.events?.[programStage] || [];
          let eventIdentifiers = Object.entries(mapping).filter(([_, { unique }]) => unique).map(([dataElement, { equivalent }]) => {
            return [dataElement, equivalent.value];
          });
          if (dateIdentifiesEvent) {
            eventIdentifiers = [...eventIdentifiers, ['eventDate', eventDateColumn.value]]
          }
          if (eventUIDProvided) {
            eventIdentifiers = [...eventIdentifiers, ['event', eventUIDColumn.value]]
          }

          const eIdentifiers = fromPairs(eventIdentifiers);
          const identifierKeys = Object.keys(eIdentifiers);

          oldStageEvents = oldStageEvents.map((event: any) => {
            const netValue = identifierKeys.map((element: string) => {
              return event[element];
            }).join('');
            return { ...event, [identifierKeys.join('')]: netValue }
          });
          const groupedOldEvents = groupBy(oldStageEvents, identifierKeys.join(''));
          let allEvents = {};
          for (const d of data) {
            const enrollmentDate = format(parseISO(d[enrollmentDateColumn.value]), 'yyyy-MM-dd');
            const eDate = format(parseISO(d[eventDateColumn.value]), 'yyyy-MM-dd');
            const constructedIdentifier = eventIdentifiers.map(([dataElement, column]) => {
              if (dataElement === 'eventDate') {
                return eDate;
              }
              return d[column];
            }).join('');

            const previousEvent = groupedOldEvents[constructedIdentifier];
            const dataValues = [];

            for (const [dataElement, valueMapping] of Object.entries(mapping)) {
              const value = d[valueMapping.equivalent.value];
              if (mapping.optionSetValue) {
                const search = optionSets[valueMapping.optionSet].find((o: any) => o.code === value || o.name === value);
                if (search) {
                  dataValues.push({ dataElement, value: search.code })
                } else {
                  warnings.push({ identifier, message: `Could not find option ${value}: expected ${optionSets[valueMapping.optionSet].map((x: any) => x.code).join(',')}` })
                }
              } else if (validate(valueMapping, value)) {
                dataValues.push({ dataElement, value: findValue(valueMapping, value) });
              } else {
                warnings.push({ identifier, message: `Failed to validate ${value} as ${mapping.valueType}` })
              }
            }

            const dataValueObjects = fromPairs(dataValues.map(({ dataElement, value }: any) => [dataElement, value]));
            let currentEvent = { programStage, eventDate: eDate, orgUnit, program: resource, status: 'ACTIVE' };
            if (completeEvents) {
              currentEvent = { ...currentEvent, status: 'COMPLETED' }
            }
            if (updateEvents && previousEvent.length === 1) {
              const { eventDate, status, orgUnit, event, program, enrollment, programStage, ...previousDataValues } = previousEvent[0];
              console.log(previousDataValues, dataValueObjects)
              const changes = diff(previousDataValues, dataValueObjects);
              console.log(changes);
              if (changes && changes.find((ch) => ch.kind === 'N' || ch.kind === 'E')) {
                const dataValues = Object.entries({ ...previousDataValues, ...dataValueObjects }).map(([dataElement, value]) => {
                  return { dataElement, value }
                });
                eventUpdates.push({
                  dataValues, eventDate, status, orgUnit, program, event, programStage, enrollment
                })
              }
            } else if (createEvents && !previousEvent) {
              if (onlyEnrollOnce && !isEmpty(enrollmentIds))
                events.push({
                  ...currentEvent,
                  event: generateUid(),
                  trackedEntityInstance,
                  enrollment: enrollmentIds[enrollmentDate],
                  dataValues
                })
            }
            if (!isRepeatable) {
              break;
            }
          }
        }
      } else {
        missingOrganisations.push(foundOrgUnit);
      }
    }
    setProcessedData({ enrollments, enrollmentUpdates, trackedEntityInstanceUpdates, trackedEntityInstances, eventUpdates, events, missingOrganisations, warnings })
    onClose();
  }
  return (
    <TrackerDataPreview />
  )
}

export default DataPreview

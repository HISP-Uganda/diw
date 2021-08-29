import axios, { AxiosInstance } from 'axios';
import { fromPairs, range } from 'lodash';
import {
  useQueries, useQuery
} from 'react-query';
import {
  dataSetOrgUnitsPayload,
  orgUnitsPayload,
  programOrgUnitsPayload
} from '../utils';
import {
  addAttributeMapping, addAttributionMapping, addOrgUnitMapping, changeStageMapping, next,
  onClose, setDestinationOrganisationUnits, setDestinationResource, setLocalOrgUnitLevels, setRemoteOrgUnitLevels, setSavedMappings,
  setSourceOrganisationUnits, setSourceResource
} from './models/Events';
import { Mapping, StageMapping, TrackedData, Value, ValueMapping } from './models/interfaces';

export const createAPI = (url: string, username: string = '', password: string = '') => {
  if (username && password) {
    return axios.create({
      baseURL: url,
      auth: { username, password }
    });
  }
  return axios.create({
    baseURL: url
  });
}

const processOrgUnitRows = ({ listGrid: { headers, rows } }: any, levels: { [k: number]: string } = {}) => {
  let units = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let parent = {};
    const idIndex = headers.findIndex((h: any) => h.name === 'organisationunituid');
    const levelIndex = headers.findIndex((h: any) => h.name === `level`);
    const level = row[levelIndex];
    const nameIndex = headers.findIndex((h: any) => h.name === `namelevel${level}`);
    if (level > 1) {
      const parents = range(1, level).map((l: number) => {
        const parentIndex = headers.findIndex((h: any) => h.name === `namelevel${l}`);
        return [levels[l] || l, row[parentIndex]]
      });
      parent = fromPairs(parents)
    }
    units.push({
      id: row[idIndex],
      name: row[nameIndex],
      parent
    })
  }
  return units;
}

export async function fetchSqlViewRemoteUnits(api: AxiosInstance, sqlViewId: string, search: string, value: number | string, levels: { [k: number]: string } = {}) {
  await api.post('/api/metadata', { sqlViews: [dataSetOrgUnitsPayload, programOrgUnitsPayload, orgUnitsPayload] });
  const { data } = await api.get(`/api/sqlViews/${sqlViewId}/data`, { params: { page: 1, pageSize: 1000, var: `${search}:${value}` } });
  let organisations = processOrgUnitRows(data, levels);
  const { pager: { pageCount } } = data;
  if (pageCount > 1) {
    let requests = await Promise.all(range(2, pageCount + 1).map((page: number) => {
      return api.get(`/api/sqlViews/${sqlViewId}/data`, { params: { page, pageSize: 1000, var: `${search}:${value}` } })
    }));

    for (let i = 0; i < requests.length; i++) {
      const { data } = requests[i];
      organisations = [...organisations, ...processOrgUnitRows(data, levels)]
    }
  }
  return organisations;
}

export async function fetchSqlViewLocalUnits(d2: any, sqlViewId: string, search: string, value: number | string, levels: { [k: number]: string } = {}) {
  const api = d2.Api.getApi();
  const response = await api.get(`sqlViews/${sqlViewId}/data`, { page: 1, pageSize: 1000, var: `${search}:${value}` });
  let organisations = processOrgUnitRows(response, levels);
  const { pager: { pageCount } } = response;
  if (pageCount > 1) {
    let requests = await Promise.all(range(2, pageCount + 1).map((page: number) => {
      return api.get(`sqlViews/${sqlViewId}/data`, { page, pageSize: 1000, var: `${search}:${value}` })
    }));

    for (let i = 0; i < requests.length; i++) {
      organisations = [...organisations, ...processOrgUnitRows(requests[i], levels)]
    }
  }
  return organisations;
}

export function useResources(d2: any, type: Value) {
  const resource = type.value.startsWith('P') ? 'programs.json' : 'dataSets.json';
  const api = d2.Api.getApi();
  return useQuery<any, Error>(
    ["resources", type.value],
    async () => {
      let params: any = {
        fields: 'id,name'
      }
      const [resources, { organisationUnitLevels }] = await Promise.all([
        api.get(resource, params),
        api.get('organisationUnitLevels', { paging: false, fields: 'name,level', order: 'level:asc' })
      ]);
      setLocalOrgUnitLevels(organisationUnitLevels)
      return resources['programs'] || resources['dataSets']
    },
    {}
  );
}

export function useRemoteResources(api: AxiosInstance, type: Value) {
  const resource = type.value.startsWith('P') ? '/api/programs.json' : '/api/dataSets.json';
  return useQuery<any, Error>(
    ["remote-resources", type],
    async () => {
      let params: any = {
        fields: 'id,name',
        paging: false
      }
      const [{ data }, { data: { organisationUnitLevels } }] = await Promise.all([
        api.get(resource, { params }),
        api.get('/api/organisationUnitLevels', { params: { paging: false, fields: 'name,level', order: 'level:asc' } })
      ]);
      setRemoteOrgUnitLevels(organisationUnitLevels)
      return data['programs'] || data['dataSets']
    },
    {}
  );
}

export function useRemoteOrganisations(api: AxiosInstance, level: string) {
  const resource = '/api/organisationUnits.json';
  return useQuery<any, Error>(
    ["remote-organisations", level],
    async () => {
      let params: any = {
        fields: 'id,name',
        level,
        paging: false
      }
      const { data: { organisationUnits } } = await api.get(resource, { params });
      return organisationUnits;
    },
    {}
  );
}

export function useLoader(d2: any) {
  const api = d2.Api.getApi();
  return useQuery<any, Error>("sqlViews", async () => {
    await api.post('metadata', { sqlViews: [dataSetOrgUnitsPayload, programOrgUnitsPayload, orgUnitsPayload] });
    return true
  });
}

export function useResource(d2: any, type: Value, resourceId: string, ax: AxiosInstance = undefined, localOrgUnitLevels: any[], remoteOrgUnitLevels: any[], remoteResourceId: string = '', remoteLevel: string = '') {
  const unitsInfo = type.value.startsWith('P') ? { id: 'ZErnQQ38kJY', search: 'program' } : { id: 'pErnQQ38kJY', search: 'dataset' };
  const resource = type.value.startsWith('P') ? `programs/${resourceId}.json` : `dataSets/${resourceId}.json`;
  const destinationLevels = fromPairs(localOrgUnitLevels.map((level) => [level.level, level.name]));
  const sourceLevels = fromPairs(remoteOrgUnitLevels.map((level) => [level.level, level.name]));
  const urls = {
    P3: {
      url: `/api/programs/${remoteResourceId}.json`,
      params: { fields: 'id,name,displayName,lastUpdated,selectIncidentDatesInFuture,onlyEnrollOnce,selectEnrollmentDatesInFuture,programType,trackedEntityType,trackedEntity,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSetValue,optionSet[id]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSetValue,optionSet[id]]]],categoryCombo[id,name,categories[id,name,code],categoryOptionCombos[id,name]]' }
    },
    P4: {
      url: '/',
      params: {}
    },
    C5: {
      url: '/',
      params: {}
    },
    C6: {
      url: '/api/programIndicators.json',
      params: {
        paging: false
      }
    },
    C7: {
      url: '/api/dataElements.json',
      params: {
        paging: false,
        filter: 'domainType:eq:AGGREGATE'
      }
    },
    C8: {
      url: '/api/indicators.json',
      params: {
        paging: false
      }
    },
    C9: {
      url: `/api/dataSets/${remoteResourceId}.json`,
      params: { fields: 'fields=id,name,code,periodType,categoryCombo[id,name,code,isDefault,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]]' }
    }
  }
  const api = d2.Api.getApi();
  return useQuery<any, Error>(
    ["resources", type.value, resourceId, remoteResourceId],
    async () => {
      let params: any = {
        fields: type.value.startsWith('P') ? 'id,name,displayName,lastUpdated,selectIncidentDatesInFuture,onlyEnrollOnce,selectEnrollmentDatesInFuture,programType,trackedEntityType,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSetValue,optionSet[id]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSetValue,optionSet[id]]]],categoryCombo[id,name,categories[id,name,code],categoryOptionCombos[id,name]]' : 'fields=id,name,code,periodType,categoryCombo[id,name,code,isDefault,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]]'
      }
      let requests = [api.get(resource, params), fetchSqlViewLocalUnits(d2, unitsInfo.id, unitsInfo.search, resourceId, destinationLevels)];

      if (['C5', 'C6', 'C7', 'C8', 'C9', 'P3'].indexOf(type.value) !== -1) {
        requests = [...requests, ax.get(urls[type.value].url, { params: urls[type.value].params })]
      }
      if (['C6', 'C7', 'C8'].indexOf(type.value) !== -1) {
        requests = [...requests, fetchSqlViewRemoteUnits(ax, 'PEYXsyvCwbt', 'level', remoteLevel, sourceLevels)]
      }

      if (type.value === 'P3') {
        requests = [...requests, fetchSqlViewRemoteUnits(ax, 'ZErnQQ38kJY', 'program', remoteResourceId)]
      }
      if (type.value === 'C9') {
        requests = [...requests, fetchSqlViewRemoteUnits(ax, 'pErnQQ38kJY', 'dataset', remoteResourceId)]
      }
      let currentResource = await Promise.all(requests);
      setDestinationResource(currentResource[0]);
      setDestinationOrganisationUnits(currentResource[1]);
      if (['C6', 'C7', 'C8', 'C9', 'P3'].indexOf(type.value) !== -1) {
        setSourceOrganisationUnits(currentResource[currentResource.length - 1]);
        setSourceResource(currentResource[2]['data']);
      }
      if (type.value === 'P4' || type.value === 'C4') {

      }
      return true;
    }
  );
}

export function useDataStore(d2: string, namespace: string) {
  return useQuery<any, Error>(
    ["dataStore", namespace],
    async () => {
      const mappings = await getNamespace(d2, namespace);
      setSavedMappings(mappings);
      return mappings;
    },
    {}
  );

}

export async function getNamespace(d2: any, namespace: string) {
  const api = d2.Api.getApi();
  try {
    return await api.get(`dataStore/${namespace}`);
  } catch (error) {
    return []
  }
}

export async function getNamespaceData(d2: any, namespace: string, key: string) {
  const api = d2.Api.getApi();
  try {
    return await api.get(`dataStore/${namespace}/${key}`);
  } catch (error) {
    return {}
  }
}

export async function createNameSpace(d2: any, namespace: string, key: string, data: any) {
  const api = d2.Api.getApi();
  try {
    return await api.post(`dataStore/${namespace}/${key}`, data);
  } catch (error) {
    console.log(error);
  }
}

export async function postData(d2: any, processedData: TrackedData) {
  console.log(processedData)
  const api = d2.Api.getApi();
  try {
    if (processedData.trackedEntityInstances) {
      await api.post('trackedEntityInstances', { trackedEntityInstances: processedData.trackedEntityInstances });
    }
    if (processedData.enrollments) {
      await api.post('enrollments', { enrollments: processedData.enrollments });
    }
    if (processedData.events) {
      await api.post('events', { events: processedData.events });
    }
    if (processedData.eventUpdates) {
      await api.post('events', { events: processedData.eventUpdates });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updateNameSpace(d2: any, namespace: string, key: string, data: any) {
  const api = d2.Api.getApi();
  try {
    return await api.update(`dataStore/${namespace}/${key}`, data);
  } catch (error) {
    console.log(error);
  }
}

export function useNamespaces(d2: any, namespace: string, mappings: string[]) {
  return useQueries(
    mappings.map((mapping: string) => {
      return {
        queryKey: [namespace, mapping],
        queryFn: () => getNamespaceData(d2, namespace, mapping),
      }
    })
  )
}

export function useSavedMapping(d2: any, mapping: string, mappingType: Value) {
  let requests = [
    getNamespaceData(d2, 'diw-ou-mapping', mapping),
    getNamespaceData(d2, 'diw-attribution-mapping', mapping),
  ]

  if (mappingType.value.startsWith('P')) {
    requests = [
      ...requests,
      getNamespaceData(d2, 'diw-stage-mapping', mapping),
      getNamespaceData(d2, 'diw-attribute-mapping', mapping),
    ]
  } else if (mappingType.value.startsWith('C')) {
    requests = [...requests, getNamespaceData(d2, 'diw-coc-mapping', mapping)]
  }
  return useQuery<any, Error>(
    ["saved-mapping", mapping],
    async () => {
      const [ouMapping, attributionMapping, ...rest] = await Promise.all(requests);
      addOrgUnitMapping(ouMapping);
      addAttributionMapping(attributionMapping);

      if (mappingType.value.startsWith('P')) {
        const [stageMapping, attributeMapping] = rest;
        addAttributeMapping(attributeMapping)
        changeStageMapping(stageMapping)
      } else {
        const [cocMapping] = rest
      }
      onClose();
      next()
      return true;
    },
    { enabled: !!mapping && !!mappingType }
  );

}

export async function saveMapping(
  d2: any,
  mapping: Mapping,
  organisationUnitMapping: { [key: string]: ValueMapping },
  attributeMapping: { [key: string]: ValueMapping },
  stageMapping: { [key: string]: StageMapping },
  categoryOptionComboMapping: { [key: string]: ValueMapping },
  attributionMapping: { [key: string]: ValueMapping },
  create = true
) {
  const {
    id,
    name,
    description,
    orgUnitColumn,
    otherOrgUnitColumns,
    resource,
    resourceName,
    remoteLogins,
    remoteResource,
    remoteResourceName,
    // organisationUnitMapping,
    // attributeMapping,
    // attributionMapping,
    // stageMapping,
    // categoryOptionComboMapping,
    type,
    dataSetInfo,
    trackerInfo,
    // categoriesMapping,
    destParents,
    sourceParents,
    sheet
  } = mapping;
  const func = create ? createNameSpace : updateNameSpace

  let requests = [
    func(d2, 'diw-ou-mapping', id, organisationUnitMapping),
    func(d2, 'diw-attribution-mapping', id, attributionMapping),
  ]
  if (type.value.startsWith('P')) {
    requests = [
      func(d2, 'diw-mappings', id, {
        name,
        description,
        orgUnitColumn,
        otherOrgUnitColumns,
        resource,
        resourceName,
        remoteLogins,
        remoteResource,
        remoteResourceName,
        type,
        trackerInfo,
        // categoriesMapping,
        destParents,
        sourceParents,
        sheet
      }),
      ...requests,
      func(d2, 'diw-stage-mapping', id, stageMapping),
      func(d2, 'diw-attribute-mapping', id, attributeMapping),
    ]
  } else if (type.value.startsWith('C')) {
    requests = [
      func(d2, 'diw-mappings', id, {
        name,
        description,
        orgUnitColumn,
        otherOrgUnitColumns,
        resource,
        resourceName,
        remoteLogins,
        remoteResource,
        remoteResourceName,
        type,
        dataSetInfo,
        // categoriesMapping,
        destParents,
        sourceParents,
        sheet
      }),
      ...requests,
      func(d2, 'diw-coc-mapping', id, categoryOptionComboMapping),
    ]
  }
  await Promise.all(requests);
}
import {
  useQuery
} from 'react-query';
import axios, { AxiosInstance } from 'axios';

import { setCurrentRemoteResource, setCurrentResource, setDestinationOrganisationUnits, setLevels, updateCurrentRemoteResource } from './Events';
import { Value } from './interfaces';
import { dataSetOrgUnitsPayload, programOrgUnitsPayload } from './utils';
import { fromPairs, max, range } from 'lodash';

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
      const resources = await api.get(resource, params);
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
      const { data } = await api.get(resource, { params });
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
    await api.post('metadata', { sqlViews: [dataSetOrgUnitsPayload, programOrgUnitsPayload] });
    return true
  });
}


export function useResource(d2: any, type: Value, resourceId: string, ax: AxiosInstance = undefined, remoteResourceId: string = '') {
  const unitsInfo = type.value.startsWith('P') ? { id: 'ZErnQQ38kJY', search: 'program' } : { id: 'pErnQQ38kJY', search: 'dataset' };
  const resource = type.value.startsWith('P') ? `programs/${resourceId}.json` : `dataSets/${resourceId}.json`;
  const urls = {
    P3: {
      url: `/api/programs/${remoteResourceId}.json`,
      params: { fields: 'id,name,displayName,lastUpdated,selectIncidentDatesInFuture,selectEnrollmentDatesInFuture,programType,trackedEntityType,trackedEntity,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSetValue,optionSet[options[name,code]]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSetValue,optionSet[options[name,code]]]]],organisationUnits[id,code,name],categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,name]]]' }
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
      params: { fields: 'id,name,code,periodType,categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,name]]],dataSetElements[dataElement[id,name,code,valueType,dataSetElements[dataSet,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]],categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]]' }
    }
  }
  const api = d2.Api.getApi();
  return useQuery<any, Error>(
    ["resources", type.value, resourceId, remoteResourceId],
    async () => {

      const { organisationUnitLevels } = await api.get('organisationUnitLevels', { paging: false, fields: 'id,name,level' });
      const localLevels: { [k: number]: string } = fromPairs(organisationUnitLevels.map((l: any) => [parseInt(l.level), l.name]))

      let params: any = {
        fields: type.value.startsWith('P') ? 'id,name,displayName,lastUpdated,selectIncidentDatesInFuture,selectEnrollmentDatesInFuture,programType,trackedEntityType,trackedEntity,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSetValue,optionSet[options[name,code]]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSetValue,optionSet[options[name,code]]]]],categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,name]]]' : 'id,name,code,periodType,categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,name]]],dataSetElements[dataElement[id,name,code,valueType,dataSetElements[dataSet,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]],categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]]'
      }

      let requests = [api.get(resource, params), fetchSqlViewLocalUnits(d2, unitsInfo.id, unitsInfo.search, resourceId, localLevels)];

      if (['C5', 'C6', 'C7', 'C8', 'C9', 'P3', 'P4'].indexOf(type.value) !== -1) {
        requests = [...requests, ax.get(urls[type.value].url, { params: urls[type.value].params })]
      }
      if (['C6', 'C7', 'C8'].indexOf(type.value) !== -1) {
        const { data: { organisationUnitLevels } } = await ax.get('/api/organisationUnitLevels', { params: { paging: false, fields: 'id,name,level' } });
        const remoteLevels: { [k: number]: string } = fromPairs(organisationUnitLevels.map((l: any) => [parseInt(l.level), l.name]))
        setLevels(organisationUnitLevels);
        const maxLevel: any = max(organisationUnitLevels.map((level: any) => level.level)) || 1;
        requests = [...requests, fetchSqlViewRemoteUnits(ax, 'PEYXsyvCwbt', 'level', maxLevel, remoteLevels)]
      }

      if (type.value === 'P3') {
        requests = [...requests, fetchSqlViewRemoteUnits(ax, 'ZErnQQ38kJY', 'program', remoteResourceId)]
      }
      if (type.value === 'C9') {
        requests = [...requests, fetchSqlViewRemoteUnits(ax, 'pErnQQ38kJY', 'dataset', remoteResourceId)]
      }
      let currentResource = await Promise.all(requests);
      // currentResource = { ...currentResource };
      setCurrentResource(currentResource[0]);
      setDestinationOrganisationUnits(currentResource[1])

      if (['C5', 'C9', 'P3', 'P4'].indexOf(type.value) !== -1) {
        // setCurrentRemoteResource(currentResource[1])
      }
      if (['C6', 'C7', 'C8'].indexOf(type.value) !== -1) {
        // setCurrentRemoteResource(currentResource[1]['programIndicators'] || currentResource[1]['dataElements'] || currentResource[1]['indicators'])
        // setLevels(currentResource[2]['organisationUnitLevels'])
      }
      return true;
    }
  );
}

export function useDataStore(d2: string, namespace: string) {
  return useQuery<any, Error>(
    ["dataStore", namespace],
    async () => {
      return await getNamespace(d2, namespace);
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

export async function updateNameSpace(d2: any, namespace: string, key: string, data: any) {
  const api = d2.Api.getApi();
  try {
    return await api.put(`dataStore/${namespace}/${key}`, data);
  } catch (error) {
    console.log(error);
  }
}
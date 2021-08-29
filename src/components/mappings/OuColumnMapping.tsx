
import { FormControl, FormHelperText, FormLabel } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import Select from 'react-select';
import { changeMappingAttribute } from '../models/Events';
import { app } from '../models/Store';
export const OuColumnMapping = () => {
  const store = useStore(app)
  return (
    <>
      <FormControl isRequired>
        <FormLabel>Organisation Column</FormLabel>
        <Select placeholder="Organisation Unit Column" options={store.sourceResource} value={store.mapping.orgUnitColumn} onChange={(e: any) => changeMappingAttribute({ key: 'orgUnitColumn', value: e })} />
      </FormControl>
      <FormControl>
        <FormLabel>Other Organisation Column</FormLabel>
        <Select placeholder="Organisation Unit Column" isMulti options={store.sourceResource} value={store.mapping.otherOrgUnitColumns} onChange={(e: any) => changeMappingAttribute({ key: 'otherOrgUnitColumns', value: e })} />
        <FormHelperText>In descending order beginning with highest level</FormHelperText>
      </FormControl>
    </>
  )
}

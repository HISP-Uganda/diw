import { Box, Button, Checkbox, Stack } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { FC } from 'react';
import Select from 'react-select';
import { mark } from '../../utils';
import { $OrganisationMapping, addOrganisationMapping, removeOrganisationMapping } from './model';

type OrganisationMappingProps = {
  sourceOrganisations: any[];
  destinationOrganisations: any[]
}

export const addOrganisation = (key: string, isIdentifier: boolean) => (equivalent: any) => {
  if (equivalent) {
    addOrganisationMapping({ [key]: { equivalent, isIdentifier } });
  } else {
    removeOrganisationMapping(key)
  }
}

export const OuMapping: FC<OrganisationMappingProps> = ({ sourceOrganisations, destinationOrganisations }) => {
  const organisationMapping = useStore($OrganisationMapping)
  return (
    <Stack spacing="5" direction="column" >
      <Stack spacing={10} direction="row">
        <Checkbox>Mapped</Checkbox>
        <Checkbox>UnMapped</Checkbox>
      </Stack>
      <Stack direction="row" alignItems="center" spacing="50px">
        <Box flex={1}>Name</Box>
        <Box w="100px" textAlign="center">Required</Box>
        <Box w="100px" textAlign="center">Unique</Box>
        <Box flex={1}>Mapping</Box>
        <Box w="100px" textAlign="center">Option Mapping</Box>
        <Box w="100px" textAlign="center">Identifier</Box>
      </Stack>
      <Stack direction="column" overflow="auto" h="500px">
        {sourceOrganisations.map((d: any) => <Stack key={d.id} direction="row" alignItems="center" spacing="50px">
          <Box flex={1}>{d.name}</Box>
          <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={d.mandatory} /></Box>
          <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={d.unique} /></Box>
          <Box flex={1}>
            <Select placeholder="Select Sheet" value={organisationMapping[d.id]?.equivalent} onChange={addOrganisation(d.id, d.unique)} options={destinationOrganisations} />
          </Box>
          <Box w="100px" textAlign="center">{d.optionSetValue && <Button>Map Options</Button>}</Box>
          <Box w="100px" textAlign="center"><Checkbox isChecked={organisationMapping[d.id]?.isIdentifier} isDisabled={!organisationMapping[d.id]?.equivalent} onChange={mark(d.id)} /></Box>
        </Stack>)}
      </Stack>
    </Stack>
  )
}
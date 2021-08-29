import { Box, Button, Checkbox, Stack } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import Select from 'react-select';
import { $attributeMapping, app } from '../models/Store';
import { addAttribute, mark } from '../../utils';

export const AttributeMapping = () => {
  const store = useStore(app);
  const attributeMapping = useStore($attributeMapping)
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
        {store.destinationAttributes.map(({ id, name, mandatory, valueType, unique, optionSetValue, optionSet }: any) => <Stack key={id} direction="row" alignItems="center" spacing="50px">
          <Box flex={1}>{name}</Box>
          <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={mandatory} /></Box>
          <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={unique} /></Box>
          <Box flex={1}>
            <Select isClearable placeholder="Select Sheet" value={attributeMapping[id]?.equivalent} onChange={addAttribute(id, { optionSetValue, optionSet: optionSet ? optionSet.id : '', mandatory, unique, manual: false, valueType })} options={store.sourceResource} />
          </Box>
          <Box w="100px" textAlign="center">{optionSetValue && <Button>Map Options</Button>}</Box>
          <Box w="100px" textAlign="center"><Checkbox isChecked={attributeMapping[id]?.unique} isDisabled={!attributeMapping[id]?.equivalent} onChange={mark(id)} /></Box>
        </Stack>)}
      </Stack>
    </Stack>
  )
}
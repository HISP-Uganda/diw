import { Box, Button, Checkbox, Stack } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import Select from 'react-select'

import { app, attributes, registrationColumns } from '../../Store';
import { addAttribute, mark } from '../../utils';
export const AttributeMapping = () => {
  const attributes$ = useStore(attributes);
  const registrationColumns$ = useStore(registrationColumns)
  const store = useStore(app)
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
        {attributes$.map((d: any) => <Stack key={d.id} direction="row" alignItems="center" spacing="50px">
          <Box flex={1}>{d.name}</Box>
          <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={d.mandatory} /></Box>
          <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={d.unique} /></Box>
          <Box flex={1}>
            <Select placeholder="Select Sheet" value={store.mapping.attributeMapping[d.id]?.equivalent} onChange={addAttribute(d.id, d.unique)} options={registrationColumns$} />
          </Box>
          <Box w="100px" textAlign="center">{d.optionSetValue && <Button>Map Options</Button>}</Box>
          <Box w="100px" textAlign="center"><Checkbox isChecked={store.mapping.attributeMapping[d.id]?.isIdentifier} isDisabled={!store.mapping.attributeMapping[d.id]?.equivalent} onChange={mark(d.id)} /></Box>
        </Stack>)}
      </Stack>
    </Stack>
  )
}
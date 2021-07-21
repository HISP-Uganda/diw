import {
  FormControl,FormLabel, Input, SimpleGrid
} from '@chakra-ui/react';
export const ProgramMapping = () => {
  return (
    <SimpleGrid columns={3} spacing={5} flex={1}>
      <FormControl id="headerRow" isRequired>
        <FormLabel>OTHER DHIS2 URL</FormLabel>
        <Input placeholder="Other DHIS2 URL" />
      </FormControl>
      <FormControl id="dataStartRow" isRequired>
        <FormLabel>Data Start Row</FormLabel>
        <Input placeholder="Other DHIS2 Username" />
      </FormControl>
      <FormControl id="dataStartRow" isRequired>
        <FormLabel>Organisation Column</FormLabel>
        <Input placeholder="Other DHIS2 Password" type="password" />
      </FormControl>
    </SimpleGrid>
  )
}
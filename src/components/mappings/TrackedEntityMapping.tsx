
import { Checkbox, FormControl, FormLabel, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import Select from 'react-select'
import { app, booleans, excelSheets, registrationColumns } from "../../Store";
import { onChange2, onCheck } from '../../utils';
import { AttributeMapping } from "./AttributeMapping";
export const TrackedEntityMapping = () => {
  const store = useStore(app);
  const registrationColumns$ = useStore(registrationColumns);
  const sheets = useStore(excelSheets);
  const bools = useStore(booleans);
  return (
    <Stack spacing="6">
      <Text>Attribute Mappings for {store.currentResource.name}</Text>
      {bools.showSelectSheet && <FormControl isRequired>
        <FormLabel>Registration</FormLabel>
        <Select placeholder="Select sheet with registration details" value={store.mapping.registrationSheet} onChange={onChange2("registrationSheet")} options={sheets} />
      </FormControl>}
      {(!!store.mapping.registrationSheet || !bools.showSelectSheet) && <>
        <FormControl>
          <FormLabel>Enrollment & Registration Options</FormLabel>
          <Stack spacing={10} direction="row">
            <Checkbox isChecked={store.mapping.createEntities} onChange={onCheck('createEntities')}>Register New Entities </Checkbox>
            <Checkbox isChecked={store.mapping.updateEntities} onChange={onCheck('updateEntities')}>Update Registration of Entities</Checkbox>
            <Checkbox isChecked={store.mapping.createEnrollments} onChange={onCheck('createEnrollments')}>Create New Enrollments</Checkbox>
            <Checkbox isChecked={store.mapping.incidentDateProvided} onChange={onCheck('incidentDateProvided')}>Incident Date Provided</Checkbox>
            <Checkbox isChecked={store.mapping.trackedEntityInstanceProvided} onChange={onCheck('trackedEntityInstanceProvided')}>Tracked Entity Instance UID Provided</Checkbox>
          </Stack>
        </FormControl>
        {store.mapping.createEnrollments && <SimpleGrid columns={3} minChildWidth="100px" spacing="6">
          <FormControl id="sheet" isRequired>
            <FormLabel>Enrollment Date Column</FormLabel>
            <Select placeholder="Select Sheet" value={store.mapping.enrollmentDateColumn} onChange={onChange2("enrollmentDateColumn")} options={registrationColumns$} />
          </FormControl>
          {store.mapping.incidentDateProvided && <FormControl id="sheet" isRequired>
            <FormLabel>Incident Date Column</FormLabel>
            <Select placeholder="Select Sheet" value={store.mapping.incidentDateColumn} onChange={onChange2("incidentDateColumn")} options={registrationColumns$} />
          </FormControl>}
          {store.mapping.trackedEntityInstanceProvided && <FormControl id="sheet" isRequired>
            <FormLabel>Incident Date Column</FormLabel>
            <Select placeholder="Select Sheet" value={store.mapping.trackedEntityInstanceColumn} onChange={onChange2("trackedEntityInstanceColumn")} options={registrationColumns$} />
          </FormControl>}
        </SimpleGrid>}
        {(store.mapping.createEntities || store.mapping.updateEntities || store.mapping.createEnrollments) && <AttributeMapping />}
      </>}
    </Stack>
  )
}
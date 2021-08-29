
import { Checkbox, FormControl, FormLabel, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import Select from 'react-select';
import { changeCategoryMapping, onChangeTrackerInfo, onCheckTrackerInfo } from '../../utils';
import { $categoryMapping, app } from "../models/Store";
import { AttributeMapping } from './AttributeMapping';
export const TrackedEntityMapping = () => {
  const store = useStore(app);
  const categoryMapping = useStore($categoryMapping)
  return (
    <Stack spacing="6">
      <Text>Attribute Mappings</Text>
      <FormControl>
        <FormLabel>Enrollment & Registration Options</FormLabel>
        <Stack spacing={10} direction="row">
          <Checkbox isChecked={store.mapping.trackerInfo.createEntities} onChange={onCheckTrackerInfo('createEntities')}>Register New Entities </Checkbox>
          <Checkbox isChecked={store.mapping.trackerInfo.updateEntities} onChange={onCheckTrackerInfo('updateEntities')}>Update Registration of Entities</Checkbox>
          <Checkbox isChecked={store.mapping.trackerInfo.createEnrollments} onChange={onCheckTrackerInfo('createEnrollments')}>Create New Enrollments</Checkbox>
          <Checkbox isChecked={store.mapping.trackerInfo.updateEnrollments} onChange={onCheckTrackerInfo('updateEnrollments')}>Update Enrollments</Checkbox>
          {store.mapping.trackerInfo.createEnrollments && <Checkbox isChecked={store.mapping.trackerInfo.incidentDateProvided} onChange={onCheckTrackerInfo('incidentDateProvided')}>Incident Date Provided</Checkbox>}
          <Checkbox isChecked={store.mapping.trackerInfo.trackedEntityInstanceProvided} onChange={onCheckTrackerInfo('trackedEntityInstanceProvided')}>Tracked Entity Instance UID Provided</Checkbox>
        </Stack>
      </FormControl>
      {(store.mapping.trackerInfo.createEntities || store.mapping.trackerInfo.updateEntities) && <Stack>
        <SimpleGrid columns={store.destinationCategories.length} minChildWidth="100px" spacing="6">
          {store.destinationCategories.map((cate: any) =>
            <FormControl isRequired key={cate.id}>
              <FormLabel>{cate.name} Column</FormLabel>
              <Select placeholder="Select Column" value={categoryMapping[cate.id]} onChange={changeCategoryMapping(cate.id)} options={store.sourceResource} />
            </FormControl>
          )}
        </SimpleGrid>
        <SimpleGrid columns={3} minChildWidth="100px" spacing="6">
          {store.mapping.trackerInfo.createEnrollments && <FormControl id="sheet" isRequired>
            <FormLabel>Enrollment Date Column</FormLabel>
            <Select placeholder="Select Column" value={store.mapping.trackerInfo.enrollmentDateColumn} onChange={onChangeTrackerInfo("enrollmentDateColumn")} options={store.sourceResource} />
          </FormControl>}
          {store.mapping.trackerInfo.incidentDateProvided && store.mapping.trackerInfo.createEnrollments && <FormControl id="sheet" isRequired>
            <FormLabel>Incident Date Column</FormLabel>
            <Select placeholder="Select Column" value={store.mapping.trackerInfo.incidentDateColumn} onChange={onChangeTrackerInfo("incidentDateColumn")} options={store.sourceResource} />
          </FormControl>}
          {store.mapping.trackerInfo.trackedEntityInstanceProvided && <FormControl id="sheet" isRequired>
            <FormLabel>Entity Instance UID Column</FormLabel>
            <Select placeholder="Select Column" value={store.mapping.trackerInfo.trackedEntityInstanceColumn} onChange={onChangeTrackerInfo("trackedEntityInstanceColumn")} options={store.sourceResource} />
          </FormControl>}
        </SimpleGrid>
      </Stack>}
      {(store.mapping.trackerInfo.createEntities || store.mapping.trackerInfo.updateEntities || store.mapping.trackerInfo.createEnrollments) && <AttributeMapping />}
    </Stack>
  )
}
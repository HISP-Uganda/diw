import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Checkbox, FormControl, FormLabel, Stack } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { FC } from "react";
import Select from 'react-select';
import { addStageAttribute, addStageCheckboxAttribute, addStageDataElement, addStageMapping, updateStageDataElementMappingAttribute } from '../../utils';
import { OptionsProps, ProgramStageMappingProps } from "../models/interfaces";
import { $stageMapping, app } from '../models/Store';

interface Element {
  d: any,
  stage: string
}

const ColumnSelect: FC<OptionsProps> = ({ stage, attribute }) => {
  const store = useStore(app);
  const stageMapping = useStore($stageMapping)
  return <Select
    placeholder="Select Event Date Column"
    value={stageMapping[stage]?.[attribute]}
    onChange={addStageAttribute(stage, attribute)}
    isClearable
    options={store.sourceResource}
  />
}

const DataElementMapping: FC<Element> = ({ d: { id, name, compulsory, valueType, optionSetValue, optionSet }, stage }) => {
  const store = useStore(app);
  const stageMapping = useStore($stageMapping)
  return <Stack direction="row" alignItems="center" spacing="50px">
    <Box flex={1}>{name}</Box>
    <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={compulsory} /></Box>
    <Box flex={1}>
      <Select
        isClearable
        placeholder="Select column"
        value={stageMapping[stage]?.mapping[id]?.equivalent}
        onChange={addStageDataElement(stage, id, { mandatory: compulsory, optionSetValue, optionSet: optionSet ? optionSet.id : '', manual: false, valueType })}
        options={store.sourceResource}
      />
    </Box>
    <Box w="100px" textAlign="center">{optionSetValue && <Button>Map Options</Button>}</Box>
    <Box w="100px" textAlign="center"><Checkbox isChecked={stageMapping[stage]?.mapping[id]?.unique} onChange={updateStageDataElementMappingAttribute(stage, id, 'unique')} /></Box>
  </Stack>
}

export const ProgramStageMapping: FC<ProgramStageMappingProps> = ({ stage }) => {
  const store = useStore(app);
  const stageMapping = useStore($stageMapping)
  return (
    <AccordionItem>
      {({ isExpanded }) => (
        <>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {stage.name}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel py={4}>
            {isExpanded && <Stack spacing="20px">
              <Stack spacing={10} direction="row">
                <Checkbox
                  isChecked={stageMapping[stage.id]?.createEvents}
                  onChange={addStageMapping(stage.id, !!stageMapping[stage.id]?.updateEvents, 'update', stage.repeatable)}
                >
                  Create Events
                </Checkbox>
                <Checkbox
                  isChecked={stageMapping[stage.id]?.updateEvents}
                  onChange={addStageMapping(stage.id, !!stageMapping[stage.id]?.createEvents, 'create', stage.repeatable)}
                >
                  Update Events
                </Checkbox>
                {(stageMapping[stage.id]?.createEvents || stageMapping[stage.id]?.updateEvents) && <>
                  <Checkbox
                    isChecked={stageMapping[stage.id]?.dateIdentifiesEvent}
                    onChange={addStageCheckboxAttribute(stage.id, 'dateIdentifiesEvent')}
                  >
                    Event Date Uniquely Identifies Event
                  </Checkbox>
                  <Checkbox
                    isChecked={stageMapping[stage.id]?.completeEvents}
                    onChange={addStageCheckboxAttribute(stage.id, 'completeEvents')}
                  >
                    Mark Events as Complete
                  </Checkbox>
                  <Checkbox
                    isChecked={stageMapping[stage.id]?.eventUIDProvided}
                    onChange={addStageCheckboxAttribute(stage.id, 'eventUIDProvided')}
                  >
                    Event UID Column Provided
                  </Checkbox>
                </>}
              </Stack>

              {(stageMapping[stage.id]?.createEvents || stageMapping[stage.id]?.updateEvents) && <Stack spacing={5} direction="row">
                <FormControl id="type" isRequired>
                  <FormLabel>Event Date Column</FormLabel>
                  <ColumnSelect stage={stage.id} attribute="eventDateColumn" />
                </FormControl>
                {stageMapping[stage.id]?.eventUIDProvided && <FormControl id="type" isRequired>
                  <FormLabel>Event UID Column</FormLabel>
                  <ColumnSelect stage={stage.id} attribute="eventUIDColumn" />
                </FormControl>}

                {!!stageMapping[stage.id]?.eventDateColumn && <>
                  <FormControl id="type">
                    <FormLabel>Latitude Column</FormLabel>
                    <ColumnSelect stage={stage.id} attribute="latitudeColumn" />
                  </FormControl>
                  <FormControl id="type">
                    <FormLabel>Longitude Column</FormLabel>
                    <ColumnSelect stage={stage.id} attribute="longitudeColumn" />
                  </FormControl>
                </>}
              </Stack>}

              {!!stageMapping[stage.id]?.eventDateColumn && <>
                <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
                  <Box flex={1}>Name</Box>
                  <Box w="100px" textAlign="center">Required</Box>
                  <Box flex={1}>Mapping</Box>
                  <Box w="100px" textAlign="center">Option Mapping</Box>
                  <Box w="100px" textAlign="center">Identifies Event</Box>
                </Stack>
                <Stack direction="column" overflow="auto" h="400px">
                  {stage.elements.map((d: any, i: number) => <DataElementMapping key={d.id} d={d} stage={stage.id} />)}
                </Stack>
              </>}
            </Stack>}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  )
}
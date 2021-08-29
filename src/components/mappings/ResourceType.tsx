import { FormControl, FormLabel, Input, Stack, Textarea } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import Select from 'react-select';
import { app } from "../models/Store";
import { onChange, onChange2 } from "../../utils";
import { AggregateFormMapping } from "./AggregateFormMapping";
import { FileMapping } from './FileMapping';
import { JSONMapping } from "./JSONMapping";
import { RemoteLogin } from "./RemoteLogin";

const steps = {
  P1: <FileMapping />,
  P2: <JSONMapping />,
  P3: <RemoteLogin />,
  P4: <RemoteLogin />,
  C1: <FileMapping />,
  C2: <AggregateFormMapping />,
  C3: <FileMapping />,
  C4: <JSONMapping />,
  C5: <RemoteLogin />,
  C6: <RemoteLogin />,
  C7: <RemoteLogin />,
  C8: <RemoteLogin />,
  C9: <RemoteLogin />,
}

const mappingOptions = [
  {
    label: "Excel/CSV Line Listing to DHIS2 Program",
    value: "P1"
  },
  {
    label: "JSON File to DHIS2 Program",
    value: "P2"
  },
  {
    label: "DHIS2 to DHIS2 Program",
    value: "P3"
  },
  {
    label: "Other Systems (API) to DHIS2 Program",
    value: "P4"
  },
  {
    label: "Excel/CSV Line Listing to DHIS2 Data Set",
    value: "C1"
  },
  // {
  //   label: "Excel/CSV Form to DHIS2 Data Set",
  //   value: "C2"
  // },
  // {
  //   label: "Excel/CSV Tabular to DHIS2 Data Set",
  //   value: "C3"
  // },
  {
    label: "JSON File to DHIS2 Data Set",
    value: "C4"
  },
  {
    label: "Others Systems (API) to DHIS2 Data Set",
    value: "C5"
  },
  {
    label: "DHIS2 Program Indicators to DHIS2 Data Set",
    value: "C6"
  },
  {
    label: "DHIS2 Data Elements to DHIS2 Data Set",
    value: "C7"
  },
  {
    label: "DHIS2 Aggregate Indicators to DHIS2 Data Set",
    value: "C8"
  },
  {
    label: "DHIS2 to DHIS2 Data Set",
    value: "C9"
  },
]

export const ResourceType = () => {
  const store = useStore(app);
  return (
    <Stack spacing="6">
      <FormControl id="name" isRequired>
        <FormLabel>Mapping Name</FormLabel>
        <Input placeholder="Mapping Name" onChange={onChange('name')} value={store.mapping.name} />
      </FormControl>
      <FormControl id="description">
        <FormLabel>Mapping Description</FormLabel>
        <Textarea placeholder="Mapping Description" rows={4} onChange={onChange('description')} value={store.mapping.description} />
      </FormControl>
      <FormControl id="type" isRequired>
        <FormLabel>Mapping Type</FormLabel>
        <Select options={mappingOptions} onChange={onChange2('type')} value={store.mapping.type} isClearable />
      </FormControl>
      {steps[store.mapping.type?.value]}
    </Stack>
  )
}
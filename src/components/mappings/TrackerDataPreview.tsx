
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { FC } from "react";
import { app } from "../models/Store";

export const TrackerDataPreview: FC = () => {
  const store = useStore(app)
  return (
    <Tabs>
      <TabList>
        <Tab>New Tracked Entity Instances</Tab>
        <Tab>Enrollments</Tab>
        <Tab>Events</Tab>
        <Tab>Tracked Entity Instance Updates</Tab>
        <Tab>Enrollment Updates</Tab>
        <Tab>Event Updates</Tab>
        <Tab>Warnings</Tab>
        <Tab>Unmapped Organisations</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.trackedEntityInstances, null, 2)}</pre>
        </TabPanel>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.enrollments, null, 2)}</pre>
        </TabPanel>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.events, null, 2)}</pre>
        </TabPanel>
        <TabPanel>
          <p>Tracked Entity Instance Updates!</p>
        </TabPanel>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.enrollmentUpdates, null, 2)}</pre>
        </TabPanel>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.eventUpdates, null, 2)}</pre>
        </TabPanel>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.warnings, null, 2)}</pre>
        </TabPanel>
        <TabPanel>
          <pre>{JSON.stringify(store.processedData?.missingOrganisations, null, 2)}</pre>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

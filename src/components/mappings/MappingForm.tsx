import { Flex, Stack } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { useD2 } from "../../Context";
import { useResource } from "../../Queries";
import { app } from "../../Store";

export const MappingForm = () => {
  const store = useStore(app);
  const d2 = useD2()
  const { isLoading, isError, isSuccess, error } = useResource(d2, store.mapping.type, store.mapping.resource);
  return (
    <>
      {isLoading && <Flex>Loading selected resource</Flex>}
      {isSuccess && <Stack spacing="6">

      </Stack>}
      {isError && <Flex>{error.message}</Flex>}
    </>
  )
}
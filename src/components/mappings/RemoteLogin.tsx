import { FormControl, FormLabel, Input, Stack } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { onRemoteLoginChange } from "../../utils";
import { app } from "../models/Store";

export const RemoteLogin = () => {
  const store = useStore(app);
  return (
    <Stack spacing="6">
      <FormControl id="name" isRequired>
        <FormLabel>URL</FormLabel>
        <Input placeholder="URL" onChange={onRemoteLoginChange('url')} value={store.mapping.remoteLogins.url} />
      </FormControl>
      <FormControl id="username">
        <FormLabel>Username</FormLabel>
        <Input placeholder="Username" onChange={onRemoteLoginChange('username')} value={store.mapping.remoteLogins.username} />
      </FormControl>
      <FormControl id="password">
        <FormLabel>Password</FormLabel>
        <Input placeholder="Password" onChange={onRemoteLoginChange('password')} value={store.mapping.remoteLogins.password} />
      </FormControl>
    </Stack>
  )
}

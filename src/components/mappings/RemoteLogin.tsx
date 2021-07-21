import { FormControl, FormLabel, Input, Stack } from "@chakra-ui/react";
import { onChange } from "../../utils";

export const RemoteLogin = () => {
  return (
    <Stack spacing="6">
      <FormControl id="name" isRequired>
        <FormLabel>URL</FormLabel>
        <Input placeholder="URL" onChange={onChange('url')} />
      </FormControl>
      <FormControl id="username">
        <FormLabel>Username</FormLabel>
        <Input placeholder="Username" onChange={onChange('username')} />
      </FormControl>
      <FormControl id="password">
        <FormLabel>Password</FormLabel>
        <Input placeholder="Password" onChange={onChange('password')} />
      </FormControl>
    </Stack>
  )
}

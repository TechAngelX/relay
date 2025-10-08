import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('UsernameRegistryModule', (m) => {
  const usernameRegistry = m.contract('UsernameRegistry');
  return { usernameRegistry };
});

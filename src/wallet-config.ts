import { cookieStorage, createStorage } from '@wagmi/core'
import { seiTestnet } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const metadata = {
  name: "SeiMoney",
  description: "SeiMoney",
  url: "https://seimoney.link",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export const wagmiAdapter = new WagmiAdapter({storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID!,
  networks: [seiTestnet],
});

export const walletConfig = wagmiAdapter.wagmiConfig;

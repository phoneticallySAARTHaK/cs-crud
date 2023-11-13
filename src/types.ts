declare global {
  interface Window {
    googleScriptLoaded: Promise<boolean>;
    handleCredentialResponse: Exclude<
      google.accounts.id.IdConfiguration["callback"],
      undefined
    >;
    handleCredentialResponseTrap: Promise<void>;
    handleCredentialResponseTrapResolver: (d: void) => void;
  }
}

export type UserData = {
  picture: string;
  name: string;
  email: string;
};
